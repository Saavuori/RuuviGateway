package gateway

import (
	"context"
	"fmt"
	"strings"

	"github.com/Saavuori/RuuviGateway/config"
	"github.com/Saavuori/RuuviGateway/parser"
	"github.com/Saavuori/RuuviGateway/server"
	"github.com/Saavuori/RuuviGateway/value_calculator"
	"github.com/rigado/ble"
	log "github.com/sirupsen/logrus"
)

func Run(config config.Config, configPath string) {
	// Initialize SinkManager with config
	sinkManager := NewSinkManager()
	sinkManager.Update(config)

	// Start Management Web UI (passing the sink manager callback)
	server.Start(config, configPath, sinkManager.Update)

	// Initialize enabled tags state for live updating (no restart required)
	server.InitEnabledTags(config.EnabledTags)

	gwMac := config.GwMac
	if gwMac == "" {
		gwMac = "00:00:00:00:00:00"
	}



	advHandler := func(adv ble.Advertisement) {
		data := adv.ManufacturerData()
		if len(data) > 2 {
			isRuuvi := data[0] == 0x99 && data[1] == 0x04 // ruuvi company identifier

			// Reconstruct raw packet for parser
			// Flags (020106) + Length of ManData (1 byte) + Type (FF) + ManData (ID + Payload)
			// ManData = data
			rawInput := fmt.Sprintf("020106%02XFF%X", len(data)+1, data)

			log.WithFields(log.Fields{
				"mac":      strings.ToUpper(adv.Addr().String()),
				"rssi":     adv.RSSI(),
				"is_ruuvi": isRuuvi,
				"data":     fmt.Sprintf("%X", data),
			}).Trace("Received data from BLE adapter")

			if config.AllAdvertisements || isRuuvi {
				// Parse measurement (always needed for Web UI)
				measurement, ok := parser.Parse(rawInput)
				if ok {
					measurement.Mac = strings.ToUpper(adv.Addr().String())
					measurement.Rssi = i64(int64(adv.RSSI()))

					// Name priority: Config > Advertisement > Default
					if name, ok := config.TagNames[measurement.Mac]; ok {
						measurement.Name = &name
					} else if adv.LocalName() != "" {
						n := adv.LocalName()
						measurement.Name = &n
					}

					value_calculator.CalcExtendedValues(&measurement)

					// Update Web UI Cache (always, for discovery)
					server.UpdateTag(measurement)

					// Send to active sinks (SinkManager routes it automatically)
					if server.IsTagEnabled(measurement.Mac) {
						sinkManager.Push(measurement)
					}
				}
			}
		}
	}

	if config.UseMock {
		MockScan(advHandler)
		return
	}

	device, err := newDevice(config)
	if err != nil {
		log.Fatal(err)
	}
	ble.SetDefaultDevice(device)

	err = ble.Scan(context.Background(), true, advHandler, nil)
	if err != nil {
		log.WithError(err).Error("Failed to scan")
	}
}

func i64(v int64) *int64 { return &v }
