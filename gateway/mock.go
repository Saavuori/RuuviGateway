package gateway

import (
	"encoding/binary"
	"log"
	"math/rand"
	"time"

	"github.com/rigado/ble"
)

type MockAdvertisement struct {
	addr ble.Addr
	rssi int
	data []byte
}

func (m MockAdvertisement) LocalName() string                      { return "RuuviMock" }
func (m MockAdvertisement) ManufacturerData() []byte               { return m.data }
func (m MockAdvertisement) ServiceData() []ble.ServiceData         { return nil }
func (m MockAdvertisement) Services() []ble.UUID                   { return nil }
func (m MockAdvertisement) OverflowService() []ble.UUID            { return nil }
func (m MockAdvertisement) TxPowerLevel() int                      { return 0 }
func (m MockAdvertisement) Connectable() bool                      { return false }
func (m MockAdvertisement) SolicitedService() []ble.UUID           { return nil }
func (m MockAdvertisement) Addr() ble.Addr                         { return m.addr }
func (m MockAdvertisement) RSSI() int                              { return m.rssi }
func (m MockAdvertisement) AddrType() uint8                        { return 0 } // Random/Public
func (m MockAdvertisement) Timestamp() int64                       { return time.Now().Unix() }
func (m MockAdvertisement) ToMap() (map[string]interface{}, error) { return nil, nil }
func (m MockAdvertisement) Data() []byte                           { return nil }
func (m MockAdvertisement) SrData() []byte                         { return nil }

type MockTag struct {
	MAC         string
	Temperature float64
	Humidity    float64
	Pressure    int
	Voltage     int
	Sequence    uint16
}

func (t *MockTag) Update() {
	// Random walk
	t.Temperature += (rand.Float64() - 0.5) * 0.1
	t.Humidity += (rand.Float64() - 0.5) * 0.2
	t.Pressure += rand.Intn(3) - 1
	t.Sequence++

	// Bounds checking
	if t.Temperature < -30 {
		t.Temperature = -30
	}
	if t.Temperature > 80 {
		t.Temperature = 80
	}
	if t.Humidity < 0 {
		t.Humidity = 0
	}
	if t.Humidity > 99 {
		t.Humidity = 99
	}
}

func (t *MockTag) GenerateFormat5() []byte {
	buf := make([]byte, 26)
	buf[0] = 0x99
	buf[1] = 0x04
	buf[2] = 0x05 // Format 5

	// Temperature
	temp := int16(t.Temperature / 0.005)
	binary.BigEndian.PutUint16(buf[3:], uint16(temp))

	// Humidity
	hum := uint16(t.Humidity / 0.0025)
	binary.BigEndian.PutUint16(buf[5:], hum)

	// Pressure
	pres := uint16(t.Pressure - 50000)
	binary.BigEndian.PutUint16(buf[7:], pres)

	// Acceleration (Randomish)
	binary.BigEndian.PutUint16(buf[9:], uint16(rand.Intn(1000)))  // X
	binary.BigEndian.PutUint16(buf[11:], uint16(rand.Intn(1000))) // Y
	binary.BigEndian.PutUint16(buf[13:], uint16(rand.Intn(1000))) // Z

	// Power
	volts := uint16(t.Voltage) & 0b11111111111
	txPower := uint16(0b00100)
	binary.BigEndian.PutUint16(buf[15:], (volts<<5)|txPower)

	// Movement
	buf[17] = byte(rand.Intn(255))

	// Sequence
	binary.BigEndian.PutUint16(buf[18:], t.Sequence)

	// MAC (last 6 bytes)
	// For simplicity, we are not parsing the string MAC here, just hardcoding consistent bytes based on the MAC string for now
	// In a real implementation we should parse t.MAC.
	// But since we are mocking, let's just make the payload consistent with the MAC used in the advertisement logic.
	// This MockTag struct holds the MAC string which is used for ble.NewAddr().
	// To put it in the payload, we need to decode it.
	// Let's do a quick hack for the two known mock tags:
	if t.MAC == "AA:BB:CC:DD:EE:FF" {
		copy(buf[20:], []byte{0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF})
	} else if t.MAC == "11:22:33:44:55:66" {
		copy(buf[20:], []byte{0x11, 0x22, 0x33, 0x44, 0x55, 0x66})
	}

	return buf
}

func MockScan(onAdv func(ble.Advertisement)) {
	log.Println("Starting Mock BLE Scanner")
	ticker := time.NewTicker(2 * time.Second) // Slower update for easier reading
	// Seed random
	rand.Seed(time.Now().UnixNano())

	tags := []*MockTag{
		{
			MAC:         "AA:BB:CC:DD:EE:FF", // Indoor
			Temperature: 24.0,
			Humidity:    45.0,
			Pressure:    101300,
			Voltage:     3000,
			Sequence:    0,
		},
		{
			MAC:         "11:22:33:44:55:66", // Outdoor/Sauna
			Temperature: 80.0,
			Humidity:    10.0,
			Pressure:    100000,
			Voltage:     2800,
			Sequence:    1000,
		},
	}

	for range ticker.C {
		for _, tag := range tags {
			tag.Update()
			data := tag.GenerateFormat5()

			adv := MockAdvertisement{
				addr: ble.NewAddr(tag.MAC),
				rssi: -50 - rand.Intn(40),
				data: data,
			}
			onAdv(adv)
		}
	}
}
