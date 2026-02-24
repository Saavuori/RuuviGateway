package data_sinks

import (
	"sync"
	"time"

	log "github.com/sirupsen/logrus"
)

const (
	defaultBufferMaxSize   = 500_000
	defaultRetryInterval   = 30 * time.Second
	maxRetryInterval       = 5 * time.Minute
	bufferStatsLogInterval = 5 * time.Minute
)

// BufferConfig holds configuration for the retry buffer.
type BufferConfig struct {
	MaxSize       int           `yaml:"max_size" json:"max_size"`
	RetryInterval time.Duration `yaml:"retry_interval" json:"retry_interval"`
}

// BufferedPoint is a generic container for a data point that needs to be written.
// The sink-specific code serializes into this before handing off to the buffer.
type BufferedPoint struct {
	Data      interface{}
	Timestamp time.Time
}

// WriteFn is a function that attempts to write a single buffered point.
// Returns nil on success, or an error if the write should be retried.
type WriteFn func(point BufferedPoint) error

// BufferedWriter wraps a write function with an in-memory ring buffer and
// exponential-backoff retry logic.
type BufferedWriter struct {
	mu            sync.Mutex
	buffer        []BufferedPoint
	maxSize       int
	writeFn       WriteFn
	sinkName      string
	retryInterval time.Duration
	totalDropped  int64
	stopCh        chan struct{}
}

// NewBufferedWriter creates a new BufferedWriter with the given configuration.
func NewBufferedWriter(sinkName string, conf *BufferConfig, writeFn WriteFn) *BufferedWriter {
	maxSize := defaultBufferMaxSize
	retryInterval := defaultRetryInterval

	if conf != nil {
		if conf.MaxSize > 0 {
			maxSize = conf.MaxSize
		}
		if conf.RetryInterval > 0 {
			retryInterval = conf.RetryInterval
		}
	}

	bw := &BufferedWriter{
		buffer:        make([]BufferedPoint, 0, 1024), // start small, grow as needed
		maxSize:       maxSize,
		writeFn:       writeFn,
		sinkName:      sinkName,
		retryInterval: retryInterval,
		stopCh:        make(chan struct{}),
	}

	go bw.retryLoop()

	log.WithFields(log.Fields{
		"sink":           sinkName,
		"max_size":       maxSize,
		"retry_interval": retryInterval,
	}).Info("Started buffered writer")

	return bw
}

// Write attempts to write a point immediately. If the write fails, the point
// is added to the retry buffer.
func (bw *BufferedWriter) Write(point BufferedPoint) {
	err := bw.writeFn(point)
	if err != nil {
		bw.addToBuffer(point)
		log.WithFields(log.Fields{
			"sink":        bw.sinkName,
			"buffer_size": bw.BufferSize(),
			"error":       err,
		}).Warn("Write failed, point buffered for retry")
	}
}

// BufferSize returns the current number of points in the buffer.
func (bw *BufferedWriter) BufferSize() int {
	bw.mu.Lock()
	defer bw.mu.Unlock()
	return len(bw.buffer)
}

// Stop shuts down the retry goroutine.
func (bw *BufferedWriter) Stop() {
	close(bw.stopCh)
}

func (bw *BufferedWriter) addToBuffer(point BufferedPoint) {
	bw.mu.Lock()
	defer bw.mu.Unlock()

	if len(bw.buffer) >= bw.maxSize {
		// Evict oldest point
		bw.buffer = bw.buffer[1:]
		bw.totalDropped++
	}
	bw.buffer = append(bw.buffer, point)
}

func (bw *BufferedWriter) retryLoop() {
	currentInterval := bw.retryInterval
	lastStatsLog := time.Now()

	for {
		select {
		case <-bw.stopCh:
			return
		case <-time.After(currentInterval):
		}

		bw.mu.Lock()
		bufLen := len(bw.buffer)
		bw.mu.Unlock()

		if bufLen == 0 {
			// Nothing to retry; reset backoff
			currentInterval = bw.retryInterval
			continue
		}

		// Log buffer stats periodically
		if time.Since(lastStatsLog) >= bufferStatsLogInterval {
			bw.mu.Lock()
			dropped := bw.totalDropped
			bw.mu.Unlock()
			log.WithFields(log.Fields{
				"sink":          bw.sinkName,
				"buffer_size":   bufLen,
				"total_dropped": dropped,
			}).Info("Buffer status")
			lastStatsLog = time.Now()
		}

		// Try to flush the buffer
		success := bw.flushBuffer()

		if success {
			currentInterval = bw.retryInterval
			log.WithField("sink", bw.sinkName).Info("Buffer flushed successfully")
		} else {
			// Exponential backoff
			currentInterval = currentInterval * 2
			if currentInterval > maxRetryInterval {
				currentInterval = maxRetryInterval
			}
			log.WithFields(log.Fields{
				"sink":          bw.sinkName,
				"next_retry_in": currentInterval,
				"buffer_size":   bw.BufferSize(),
			}).Warn("Buffer flush failed, backing off")
		}
	}
}

func (bw *BufferedWriter) flushBuffer() bool {
	bw.mu.Lock()
	// Take a snapshot of the buffer to avoid holding the lock during writes
	toFlush := make([]BufferedPoint, len(bw.buffer))
	copy(toFlush, bw.buffer)
	bw.mu.Unlock()

	flushed := 0
	for _, point := range toFlush {
		err := bw.writeFn(point)
		if err != nil {
			// Backend still down — stop trying, keep remaining points
			bw.mu.Lock()
			// Remove only the successfully flushed points from the front
			if flushed > 0 {
				bw.buffer = bw.buffer[flushed:]
			}
			bw.mu.Unlock()
			return false
		}
		flushed++
	}

	// All flushed successfully
	bw.mu.Lock()
	bw.buffer = bw.buffer[flushed:]
	bw.mu.Unlock()
	return true
}
