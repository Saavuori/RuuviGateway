package matter

import (
	"github.com/Saavuori/ruuvi-go-gateway/config"
	"github.com/Saavuori/ruuvi-go-gateway/parser"
	log "github.com/sirupsen/logrus"
)

// Bridge is now just a placeholder as the actual Matter logic has moved to the ruuvi-matter-bridge service.
type Bridge struct {
	config *config.Matter
}

func New(conf *config.Matter) *Bridge {
	return &Bridge{
		config: conf,
	}
}

func (b *Bridge) Start() error {
	// No-op: The external service handles Matter.
	if b.config != nil && b.config.Enabled != nil && *b.config.Enabled {
		log.Info("Internal Matter stub initialized. bridging is handled by external service.")
	}
	return nil
}

func (b *Bridge) UpdateTag(m parser.Measurement) {
	// No-op
}

func (b *Bridge) GetPairingCode() string {
	return ""
}

func (b *Bridge) GetQRCode() string {
	return ""
}
