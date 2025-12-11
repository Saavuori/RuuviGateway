package server

import (
	"strings"
	"sync"
)

var (
	enabledTags     []string
	enabledTagsLock sync.RWMutex
	// If true, all tags are allowed (no filtering)
	allowAllTags bool
)

// InitEnabledTags initializes the enabled tags list from config at startup.
// If the list is empty, all tags are allowed.
func InitEnabledTags(tags []string) {
	enabledTagsLock.Lock()
	defer enabledTagsLock.Unlock()

	if len(tags) == 0 {
		allowAllTags = true
		enabledTags = nil
	} else {
		allowAllTags = false
		enabledTags = make([]string, len(tags))
		for i, t := range tags {
			enabledTags[i] = strings.ToUpper(t)
		}
	}
}

// UpdateEnabledTags updates the enabled tags list (called by API after config change).
func UpdateEnabledTags(tags []string) {
	enabledTagsLock.Lock()
	defer enabledTagsLock.Unlock()

	if len(tags) == 0 {
		allowAllTags = true
		enabledTags = nil
	} else {
		allowAllTags = false
		enabledTags = make([]string, len(tags))
		for i, t := range tags {
			enabledTags[i] = strings.ToUpper(t)
		}
	}
}

// IsTagEnabled checks if a tag with the given MAC is enabled.
// Returns true if:
// - No allowlist is set (allowAllTags is true), OR
// - The MAC is in the enabled tags list
func IsTagEnabled(mac string) bool {
	enabledTagsLock.RLock()
	defer enabledTagsLock.RUnlock()

	if allowAllTags {
		return true
	}

	upperMac := strings.ToUpper(mac)
	for _, m := range enabledTags {
		if m == upperMac {
			return true
		}
	}
	return false
}

// GetEnabledTags returns a copy of the current enabled tags list.
func GetEnabledTags() []string {
	enabledTagsLock.RLock()
	defer enabledTagsLock.RUnlock()

	if enabledTags == nil {
		return nil
	}
	result := make([]string, len(enabledTags))
	copy(result, enabledTags)
	return result
}
