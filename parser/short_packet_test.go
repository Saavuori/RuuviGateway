package parser

import (
	"strings"
	"testing"
)

// A truncated advertisement that claims a known Ruuvi data format must be
// rejected, not indexed past the end of the buffer: the input comes straight
// from the BLE adapter, so anything in radio range can send one.
func TestParseRejectsTruncatedPackets(t *testing.T) {
	// header + company identifier + format byte, padded to the given total length
	packet := func(format string, totalBytes int) string {
		body := "020106" + "FF" + "FF" + "9904" + format
		return body + strings.Repeat("00", totalBytes-len(body)/2)
	}

	cases := []struct {
		name  string
		input string
	}{
		{"format E1 one byte short", packet("E1", 35)},
		{"format E1 well short", packet("E1", 32)},
		{"format 6 one byte short", packet("06", 23)},
		{"format 5 one byte short", packet("05", 24)},
		{"format 3 one byte short", packet("03", 20)},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if _, ok := Parse(tc.input); ok {
				t.Fatalf("Parse(%s) reported success on a truncated packet", tc.input)
			}
		})
	}
}
