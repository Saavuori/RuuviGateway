# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-02-24

### Removed
- **Matter Bridge** support completely removed from the project
  - Deleted `matter-bridge/` Node.js service directory
  - Deleted `service/matter/` Go backend service package
  - Deleted `web/src/components/MatterForm.tsx` frontend component
  - Removed `Matter-Bridge` service from `docker-compose.yml`
  - Removed `MATTER_BRIDGE_URL` environment variable from `docker-compose.yml`
  - Removed `matter:` configuration section from `config.sample.yml` and `config.yml`
  - Removed `Matter` struct and field from `config/config.go`
  - Removed matter bridge initialization and update calls from `gateway/gateway.go`
  - Removed `/api/matter` route and `handleMatter` handler from `server/api.go`
  - Removed `MatterConfig` type and `matter` field from `web/src/types.ts`
  - Removed `fetchMatterStatus` API function from `web/src/lib/api.ts`
  - Removed Matter Bridge card and related UI logic from `web/src/app/page.tsx`
  - Removed `push-matter` Makefile target
  - Deleted `matter_data/` persistent storage directory
- **Reduced data sink output** — removed noisy/redundant fields from all sinks (InfluxDB, InfluxDB3, MQTT, Home Assistant MQTT Discovery, and Prometheus):
  - Removed `accelerationX`, `accelerationY`, `accelerationZ` (raw axis values)
  - Removed `accelerationAngleFromX`, `accelerationAngleFromY`, `accelerationAngleFromZ` (calculated tilt angles)
  - Removed `absoluteHumidity`, `dewPoint`, `equilibriumVaporPressure`, `airDensity` (derived humidity/pressure values)
  - `accelerationTotal` is retained as the single useful acceleration metric

### Added
- `CHANGELOG.md` to track project changes
- GitHub Actions workflow for automated Docker builds (`.github/`)
- Retry buffer support for data sinks (`data_sinks/buffer.go`, `data_sinks/buffer_test.go`)
- `install.sh` — one-liner install script for quick setup on Raspberry Pi
- Updated `README.md` with Quick Install section and one-liner `curl | bash` command

## Prior History

See git log for history prior to this changelog.
