export interface Config {
    gw_mac: string;
    all_advertisements: boolean;
    hci_index: number;
    use_mock: boolean;
    mqtt?: MQTTConfig;
    http?: HTTPConfig;
    mqtt_publisher?: MQTTPublisherConfig;
    influxdb_publisher?: InfluxDBPublisherConfig;
    influxdb3_publisher?: InfluxDB3PublisherConfig;
    prometheus?: PrometheusConfig;
    enabled_tags?: string[];
    tag_names?: Record<string, string>;
}

export interface MQTTConfig {
    enabled: boolean;
    broker_url: string;
    client_id: string;
    username?: string;
    password?: string;
    topic_prefix: string;
    lwt_topic?: string;
    lwt_online_payload?: string;
    lwt_offline_payload?: string;
    send_decoded: boolean;
}

export interface HTTPConfig {
    enabled: boolean;
    url: string;
    interval: string;
    username?: string;
    password?: string;
}

export interface MQTTPublisherConfig {
    enabled: boolean;
    broker_url: string;
    topic_prefix: string;
    client_id: string;
    username?: string;
    password?: string;
    minimum_interval: string;
    homeassistant_discovery_prefix?: string;
    retain_messages?: boolean;
}

export interface InfluxDBPublisherConfig {
    enabled: boolean;
    url: string;
    auth_token: string;
    org: string;
    bucket: string;
    measurement: string;
    minimum_interval: string;
}

export interface InfluxDB3PublisherConfig {
    enabled: boolean;
    url: string;
    auth_token: string;
    database: string;
    measurement: string;
    minimum_interval: string;
}

export interface PrometheusConfig {
    enabled: boolean;
    port: number;
    measurement_metric_prefix: string;
}


export interface Tag {
    mac: string;
    rssi: number;
    data_format: number;
    temperature?: number;
    humidity?: number;
    pressure?: number;
    battery_voltage?: number;
    tx_power?: number;
    movement_counter?: number;
    measurement_sequence_number?: number;
    // Extended fields (Format E1 / 6)
    pm1p0?: number;
    pm2p5?: number;
    pm4p0?: number;
    pm10p0?: number;
    co2?: number;
    voc?: number;
    nox?: number;
    illuminance?: number;
    sound_instant?: number;
    sound_average?: number;
    sound_peak?: number;
    air_quality_index?: number;
    // Additional fields from backend
    acceleration_x?: number;
    acceleration_y?: number;
    acceleration_z?: number;
    calibration_in_progress?: boolean;
    button_pressed_on_boot?: boolean;
    rtc_on_boot?: boolean;
    absolute_humidity?: number;
    dew_point?: number;
    equilibrium_vapor_pressure?: number;
    air_density?: number;
    acceleration_total?: number;
    acceleration_angle_from_x?: number;
    acceleration_angle_from_y?: number;
    acceleration_angle_from_z?: number;
    last_seen: number; // Unix timestamp
}

export interface SinkStatus {
    is_failing: boolean;
    buffer_size: number;
    dropped: number;
    failing_since?: string;
}

export interface SystemStatus {
    sinks: Record<string, SinkStatus>;
}
