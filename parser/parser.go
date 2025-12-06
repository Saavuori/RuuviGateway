package parser

import log "github.com/sirupsen/logrus"

var ruuviCompanyIdentifier = []byte{0x99, 0x04} // 0x0499

func f64(value float64) *float64 {
	return &value
}
func i64(value int64) *int64 {
	return &value
}

func Parse(input string) (Measurement, bool) {
	var measurement Measurement
	var err_formate1, err_format6, err_format5, err_format3 error
	if measurement, err_formate1 = ParseFormatE1(input); err_formate1 == nil {
		return measurement, true
	}
	if measurement, err_format6 = ParseFormat6(input); err_format6 == nil {
		return measurement, true
	}
	if measurement, err_format5 = ParseFormat5(input); err_format5 == nil {
		return measurement, true
	}
	if measurement, err_format3 = ParseFormat3(input); err_format3 == nil {
		return measurement, true
	}
	log.WithFields(log.Fields{
		"raw_data":        input,
		"format_e1_error": err_formate1.Error(),
		"format_6_error":  err_format6.Error(),
		"format_5_error":  err_format5.Error(),
		"format_3_error":  err_format3.Error(),
	}).Trace("Failed to parse data")
	return Measurement{}, false
}
