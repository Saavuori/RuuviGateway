import { Config, Tag, SystemStatus } from '../types';

let MOCK_CONFIG: Config = {
    gw_mac: "00:00:00:00:00:00",
    all_advertisements: false,
    hci_index: 0,
    use_mock: true,
    mqtt: {
        enabled: false,
        broker_url: "tcp://localhost:1883",
        client_id: "ruuvi-gateway",
        topic_prefix: "ruuvi",
        send_decoded: false,
    },
    mqtt_publisher: {
        enabled: false,
        broker_url: "tcp://localhost:1883",
        client_id: "ruuvi-bridge",
        topic_prefix: "ruuvi_measurements",
        minimum_interval: "1s",
        homeassistant_discovery_prefix: "homeassistant",
    },
    influxdb_publisher: {
        enabled: false,
        url: "http://localhost:8086",
        auth_token: "token",
        org: "org",
        bucket: "bucket",
        measurement: "measurements",
        minimum_interval: "1s",
        buffer: {
            max_size: 10000,
            retry_interval: "5s"
        }
    },
};

const MOCK_TAGS: Tag[] = [
    {
        mac: "AA:BB:CC:DD:EE:FF",
        rssi: -70,
        data_format: 5,
        temperature: 24.5,
        humidity: 45.0,
        pressure: 1013.25,
        battery_voltage: 2.9,
        movement_counter: 42,
        measurement_sequence_number: 1542,
        acceleration_x: 0.012,
        acceleration_y: -0.004,
        acceleration_z: 1.015,
        acceleration_total: 1.015,
        acceleration_angle_from_x: 89.1,
        acceleration_angle_from_y: 90.2,
        acceleration_angle_from_z: 1.5,
        dew_point: 11.5,
        absolute_humidity: 10.2,
        air_density: 1.185,
        equilibrium_vapor_pressure: 13.5,
        last_seen: Date.now(),
    },
    {
        mac: "11:22:33:44:55:66",
        rssi: -85,
        data_format: 5,
        temperature: 80.0,
        humidity: 20.0,
        pressure: 1000.00,
        battery_voltage: 3.0,
        movement_counter: 127,
        measurement_sequence_number: 88,
        acceleration_x: -0.5,
        acceleration_y: 0.5,
        acceleration_z: 0.7,
        acceleration_total: 0.994,
        last_seen: Date.now() - 5000,
    },
    {
        // Air Quality Sensor - Data Format 6
        mac: "AQ:12:34:56:78:9A",
        rssi: -65,
        data_format: 6,
        temperature: 22.3,
        humidity: 52.0,
        pressure: 1015.50,
        battery_voltage: 3.1,
        // Air quality extended fields
        pm1p0: 8.2,
        pm2p5: 12.5,
        pm4p0: 18.3,
        pm10p0: 22.1,
        co2: 485,
        voc: 125,
        nox: 15,
        illuminance: 320,
        sound_instant: 42.5,
        sound_average: 38.2,
        sound_peak: 58.0,
        air_quality_index: 78,
        // New diagnostic fields
        calibration_in_progress: false,
        button_pressed_on_boot: true,
        rtc_on_boot: false,
        last_seen: Date.now() - 1000,
    },
    {
        mac: "CC:DD:EE:FF:11:22",
        rssi: -60,
        data_format: 5,
        temperature: 22.5,
        humidity: 35.0,
        pressure: 1012.0,
        battery_voltage: 3.1,
        movement_counter: 15,
        calibration_in_progress: true,
        last_seen: Date.now() - 2000,
    },
];

const IS_DEV = process.env.NODE_ENV === 'development';

// Mock state for development mode
let mockEnabledTags: string[] = [];
let mockTagNames: Record<string, string> = {};

// Simulate motion in dev mode
if (IS_DEV) {
    setInterval(() => {
        MOCK_TAGS.forEach(tag => {
            // Only update tags that likely have accelerometers
            if (tag.mac !== "AQ:12:34:56:78:9A") {
                const x = tag.acceleration_x ?? 0;
                const y = tag.acceleration_y ?? 0;
                const z = tag.acceleration_z ?? 1;

                // Random jitter
                tag.acceleration_x = x + (Math.random() - 0.5) * 0.2;
                tag.acceleration_y = y + (Math.random() - 0.5) * 0.2;
                tag.acceleration_z = z + (Math.random() - 0.5) * 0.1;

                // Simple gravity normalization (keep it near 1G)
                const total = Math.sqrt(tag.acceleration_x ** 2 + tag.acceleration_y ** 2 + tag.acceleration_z ** 2);
                tag.acceleration_x /= total;
                tag.acceleration_y /= total;
                tag.acceleration_z /= total;
                tag.acceleration_total = 1.0;
                
                tag.last_seen = Date.now();
            }
        });
    }, 3000);
}

export async function fetchConfig(): Promise<Config> {
    if (IS_DEV) {
        // Include live mock state in the config
        return {
            ...MOCK_CONFIG,
            tag_names: { ...mockTagNames, ...MOCK_CONFIG.tag_names },
            enabled_tags: Array.from(new Set([...mockEnabledTags, ...(MOCK_CONFIG.enabled_tags || [])]))
        };
    }
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
}

export async function updateConfig(config: Config): Promise<void> {
    if (IS_DEV) {
        console.log("Mock update config:", config);
        MOCK_CONFIG = { ...config };
        return;
    }
    const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update config');
}

export async function fetchTags(): Promise<Tag[]> {
    if (IS_DEV) return MOCK_TAGS;
    const res = await fetch('/api/tags');
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
}

export async function enableTag(mac: string, enabled: boolean): Promise<{ success: boolean; enabled_tags: string[] }> {
    if (IS_DEV) {
        console.log("Mock enable tag:", mac, enabled);
        if (enabled) {
            // Add to enabled list if not already present
            if (!mockEnabledTags.some(m => m.toLowerCase() === mac.toLowerCase())) {
                mockEnabledTags = [...mockEnabledTags, mac];
            }
        } else {
            // Remove from enabled list
            mockEnabledTags = mockEnabledTags.filter(m => m.toLowerCase() !== mac.toLowerCase());
        }
        return { success: true, enabled_tags: [...mockEnabledTags] };
    }
    const res = await fetch('/api/tags/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac, enabled }),
    });
    if (!res.ok) throw new Error('Failed to enable tag');
    return res.json();
}

export async function restartGateway(): Promise<{ restarting: boolean }> {
    if (IS_DEV) {
        console.log("Mock restart gateway");
        return { restarting: true };
    }
    const res = await fetch('/api/restart', {
        method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to restart gateway');
    return res.json();
}

export async function setTagName(mac: string, name: string): Promise<{ success: boolean; tag_names: Record<string, string> }> {
    if (IS_DEV) {
        console.log("Mock set tag name:", mac, name);
        const upperMac = mac.toUpperCase();
        if (name === '') {
            // Remove from map
            const { [upperMac]: _, ...rest } = mockTagNames;
            mockTagNames = rest;
        } else {
            // Add/update in map
            mockTagNames = { ...mockTagNames, [upperMac]: name };
        }
        return { success: true, tag_names: { ...mockTagNames } };
    }
    const res = await fetch('/api/tags/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac, name }),
    });
    if (!res.ok) throw new Error('Failed to set tag name');
    return res.json();
}

export async function fetchVersion(): Promise<{ version: string }> {
    if (IS_DEV) return { version: "v0.1.0-dev" };
    const res = await fetch('/api/version');
    if (!res.ok) throw new Error('Failed to fetch version');
    return res.json();
}

export async function fetchStatus(): Promise<SystemStatus> {
    if (IS_DEV) {
        return {
            sinks: {
                influxdb: {
                    is_failing: MOCK_CONFIG.influxdb_publisher?.enabled || false,
                    buffer_size: MOCK_CONFIG.influxdb_publisher?.enabled ? 1420 : 0,
                    dropped: 0,
                    failing_since: MOCK_CONFIG.influxdb_publisher?.enabled ? new Date(Date.now() - 1000 * 60 * 5).toISOString() : undefined
                }
            }
        };
    }
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json();
}

