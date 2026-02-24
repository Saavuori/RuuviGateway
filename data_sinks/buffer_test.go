package data_sinks

import (
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestBufferedWriter_PassThrough(t *testing.T) {
	// When the backend is healthy, writes should pass through immediately
	var writeCount int32
	writeFn := func(bp BufferedPoint) error {
		atomic.AddInt32(&writeCount, 1)
		return nil
	}

	bw := NewBufferedWriter("test", &BufferConfig{MaxSize: 100, RetryInterval: 10 * time.Second}, writeFn)
	defer bw.Stop()

	for i := 0; i < 10; i++ {
		bw.Write(BufferedPoint{Data: i, Timestamp: time.Now()})
	}

	if got := atomic.LoadInt32(&writeCount); got != 10 {
		t.Errorf("expected 10 writes, got %d", got)
	}
	if bw.BufferSize() != 0 {
		t.Errorf("expected empty buffer, got %d", bw.BufferSize())
	}
}

func TestBufferedWriter_BuffersOnFailure(t *testing.T) {
	// When the backend fails, points should be buffered
	writeFn := func(bp BufferedPoint) error {
		return errors.New("connection refused")
	}

	bw := NewBufferedWriter("test", &BufferConfig{MaxSize: 100, RetryInterval: 10 * time.Second}, writeFn)
	defer bw.Stop()

	for i := 0; i < 5; i++ {
		bw.Write(BufferedPoint{Data: i, Timestamp: time.Now()})
	}

	if bw.BufferSize() != 5 {
		t.Errorf("expected 5 buffered points, got %d", bw.BufferSize())
	}
}

func TestBufferedWriter_EvictsOldest(t *testing.T) {
	// When buffer is full, oldest points should be evicted
	writeFn := func(bp BufferedPoint) error {
		return errors.New("connection refused")
	}

	bw := NewBufferedWriter("test", &BufferConfig{MaxSize: 3, RetryInterval: 10 * time.Second}, writeFn)
	defer bw.Stop()

	for i := 0; i < 5; i++ {
		bw.Write(BufferedPoint{Data: i, Timestamp: time.Now()})
	}

	if bw.BufferSize() != 3 {
		t.Errorf("expected buffer size 3, got %d", bw.BufferSize())
	}

	// Verify total dropped count
	bw.mu.Lock()
	dropped := bw.totalDropped
	bw.mu.Unlock()
	if dropped != 2 {
		t.Errorf("expected 2 dropped points, got %d", dropped)
	}
}

func TestBufferedWriter_RetryFlushes(t *testing.T) {
	// Buffer should flush when backend recovers
	var mu sync.Mutex
	failing := true
	var writeCount int32

	writeFn := func(bp BufferedPoint) error {
		mu.Lock()
		isFailing := failing
		mu.Unlock()
		if isFailing {
			return errors.New("connection refused")
		}
		atomic.AddInt32(&writeCount, 1)
		return nil
	}

	bw := NewBufferedWriter("test", &BufferConfig{MaxSize: 100, RetryInterval: 100 * time.Millisecond}, writeFn)
	defer bw.Stop()

	// Write 3 points while backend is down
	for i := 0; i < 3; i++ {
		bw.Write(BufferedPoint{Data: i, Timestamp: time.Now()})
	}
	if bw.BufferSize() != 3 {
		t.Errorf("expected 3 buffered points, got %d", bw.BufferSize())
	}

	// Recover the backend
	mu.Lock()
	failing = false
	mu.Unlock()

	// Wait for retry to flush
	time.Sleep(500 * time.Millisecond)

	if bw.BufferSize() != 0 {
		t.Errorf("expected empty buffer after flush, got %d", bw.BufferSize())
	}
	if got := atomic.LoadInt32(&writeCount); got != 3 {
		t.Errorf("expected 3 retried writes, got %d", got)
	}
}

func TestBufferedWriter_DefaultConfig(t *testing.T) {
	// Nil config should use defaults
	writeFn := func(bp BufferedPoint) error {
		return nil
	}

	bw := NewBufferedWriter("test", nil, writeFn)
	defer bw.Stop()

	if bw.maxSize != defaultBufferMaxSize {
		t.Errorf("expected default max size %d, got %d", defaultBufferMaxSize, bw.maxSize)
	}
	if bw.retryInterval != defaultRetryInterval {
		t.Errorf("expected default retry interval %v, got %v", defaultRetryInterval, bw.retryInterval)
	}
}
