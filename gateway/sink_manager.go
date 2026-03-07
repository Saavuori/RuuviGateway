package gateway

import (
	"sync"
	"time"

	"github.com/Saavuori/RuuviGateway/config"
	"github.com/Saavuori/RuuviGateway/data_sinks"
	"github.com/Saavuori/RuuviGateway/parser"
	log "github.com/sirupsen/logrus"
)

// SinkManager manages the active data sinks and allows dynamic reloading
type SinkManager struct {
	mu    sync.RWMutex
	sinks []chan<- parser.Measurement
}

// NewSinkManager initializes a new SinkManager
func NewSinkManager() *SinkManager {
	return &SinkManager{
		sinks: make([]chan<- parser.Measurement, 0),
	}
}

// Update rebuilds the active sinks based on the provided configuration.
// It closes existing sinks (terminating their respective routines) and starts new ones.
func (sm *SinkManager) Update(config config.Config) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	// Close old sinks to terminate their goroutines
	for _, sink := range sm.sinks {
		close(sink)
	}

	var newSinks []chan<- parser.Measurement

	if config.MQTTPublisher != nil && (config.MQTTPublisher.Enabled == nil || *config.MQTTPublisher.Enabled) {
		newSinks = append(newSinks, data_sinks.MQTT(*config.MQTTPublisher, config.TagNames))
	}
	if config.InfluxDBPublisher != nil && (config.InfluxDBPublisher.Enabled == nil || *config.InfluxDBPublisher.Enabled) {
		newSinks = append(newSinks, data_sinks.InfluxDB(*config.InfluxDBPublisher))
	}
	if config.InfluxDB3Publisher != nil && (config.InfluxDB3Publisher.Enabled == nil || *config.InfluxDB3Publisher.Enabled) {
		newSinks = append(newSinks, data_sinks.InfluxDB3(*config.InfluxDB3Publisher))
	}
	if config.Prometheus != nil && (config.Prometheus.Enabled == nil || *config.Prometheus.Enabled) {
		newSinks = append(newSinks, data_sinks.Prometheus(*config.Prometheus))
	}

	if len(newSinks) == 0 {
		log.Warn("No sinks configured. Configure via Web UI.")
	} else {
		log.Infof("Successfully reloaded %d data sinks", len(newSinks))
	}

	sm.sinks = newSinks
}

// Push sends a measurement to all currently active sinks
func (sm *SinkManager) Push(measurement parser.Measurement) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	for _, sink := range sm.sinks {
		select {
		case sink <- measurement:
		case <-time.After(100 * time.Millisecond):
			log.Warn("Sink channel full, measurement dropped")
		}
	}
}
