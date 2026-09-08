package data_sinks

import (
	"testing"

	"github.com/Saavuori/RuuviGateway/config"
)

// The sink is rebuilt from scratch whenever the config changes (see
// SinkManager.Update), so constructing it twice must not re-register the
// collectors with the default prometheus registry.
func TestPrometheusSurvivesConfigReload(t *testing.T) {
	conf := config.Prometheus{Port: 18081, MeasurementMetricPrefix: "ruuvi"}

	first := Prometheus(conf)
	second := Prometheus(conf)

	close(first)
	close(second)
}
