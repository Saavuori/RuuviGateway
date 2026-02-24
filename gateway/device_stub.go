//go:build !linux
// +build !linux

package gateway

import (
	"errors"

	"github.com/Saavuori/RuuviGateway/config"
	"github.com/rigado/ble"
)

func newDevice(conf config.Config) (ble.Device, error) {
	return nil, errors.New("real bluetooth hardware only supported on linux")
}
