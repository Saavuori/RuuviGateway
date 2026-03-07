# RuuviGateway

**RuuviGateway** is a lightweight replacement for the physical [Ruuvi Gateway](https://ruuvi.com/gateway/), allowing you to collect data from RuuviTags using a Raspberry Pi or any Linux device with a Bluetooth adapter.

It provides a modern Web UI, direct InfluxDB support, MQTT publishing with Home Assistant auto-discovery, and Prometheus metrics — all in a single Docker container.

### Features

- **Modern Web UI**: View real-time tag data (Temperature, Humidity, Pressure, Voltage, RSSI, Movement). Manage tag names, enable/disable sinks, and configure the gateway — all from the browser.
- **Ruuvi Air Support**: Full support for Ruuvi Air (Format E1) and Format 6 tags, including PM2.5, CO2, VOC, NOX, and Illuminance.
- **Multiple Data Sinks**:
  - **MQTT**: Publish to Home Assistant or other brokers, with automatic [Home Assistant MQTT Discovery](https://www.home-assistant.io/integrations/mqtt/#mqtt-discovery).
  - **InfluxDB v2 & v3**: Direct writing to time-series databases, with retry buffer for resilience.
  - **Prometheus**: Expose metrics for scraping (on a separate port, default `8081`).
- **Dockerized**: Easy deployment on Raspberry Pi (ARMv7/ARM64) and x86 systems.
- **Auto-Updates**: Includes [Watchtower](https://containrrr.dev/watchtower/) for automatic container updates.
- **Mock Scanner**: Built-in mock BLE scanner for testing on non-Linux systems (`use_mock: true`).

### Installation (Docker - Recommended)

#### Quick Install (One-liner)

Run this on your Raspberry Pi:

```bash
curl -fsSL https://raw.githubusercontent.com/Saavuori/RuuviGateway/master/install.sh | bash
```

This will:
1. Create a `ruuvigateway/` directory
2. Download `docker-compose.yml` and a starter `config.yml`
3. Print next steps including your local Web UI address

Then edit the config and start:

```bash
cd ruuvigateway
nano config.yml          # enable your sinks (MQTT, InfluxDB, etc.) and set use_mock: false
docker compose up -d
```

#### Manual Install

```bash
mkdir ruuvigateway && cd ruuvigateway
curl -O https://raw.githubusercontent.com/Saavuori/RuuviGateway/master/docker-compose.yml
curl -O https://raw.githubusercontent.com/Saavuori/RuuviGateway/master/config.sample.yml
cp config.sample.yml config.yml
nano config.yml
docker compose up -d
```

The pre-built image (`ghcr.io/saavuori/ruuvigateway:latest`) is pulled automatically — no need to build anything.

### Accessing the Web UI

Once running, the Web UI is available at:
`http://<your-pi-ip>:8080`

You can configure the port in `config.yml` under `http_listener`.

### Requirements

- Linux-based OS (Raspberry Pi OS is perfect)
- Bluetooth adapter (Internal or USB)
- Docker & Docker Compose

### Configuration

Check [config.sample.yml](./config.sample.yml) for all available options.
The configuration supports:
- **Tag Filtering**: Use `enabled_tags` to control which tags are forwarded to data sinks (manageable via the Web UI).
- **Tag Naming**: Assign human-readable names to MAC addresses (via config or the Web UI).
- **Advanced Sinks**: Fine-tune intervals and thresholds for MQTT, InfluxDB, and Prometheus.
- **Logging**: Configurable format (`structured`, `json`, `simple`) and level (`trace` through `panic`).

### Building Locally

To build and run from source:

```bash
docker build -t ruuvigateway .
docker run --net=host --privileged -v $(pwd)/config.yml:/app/config.yml:ro ruuvigateway
```
