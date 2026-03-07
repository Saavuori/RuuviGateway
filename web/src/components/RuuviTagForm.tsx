import { Tag } from '@/types';

interface RuuviTagFormProps {
    tag: Tag;
    tagName: string;
    enabled: boolean;
    onNameChange: (name: string) => void;
    onEnabledChange: (enabled: boolean) => void;
}

export function RuuviTagForm({ tag, tagName, enabled, onNameChange, onEnabledChange }: RuuviTagFormProps) {
    const inputClasses = "w-full px-3 py-2 bg-ruuvi-input-bg border border-ruuvi-border rounded-lg focus:ring-2 focus:ring-ruuvi-success/50 focus:border-ruuvi-success text-sm text-ruuvi-text placeholder-ruuvi-text-muted/30 transition-colors duration-250";
    const labelClasses = "text-sm font-medium text-ruuvi-text-muted";

    return (
        <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-ruuvi-input-bg border border-ruuvi-border rounded-lg transition-colors duration-250">
                <div>
                    <div className="font-bold text-ruuvi-text">Enable Tag</div>
                    <div className="text-sm text-ruuvi-text-muted">Forward data from this tag to sinks</div>
                </div>
                <button
                    onClick={() => onEnabledChange(!enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-ruuvi-success' : 'bg-ruuvi-toggle-bg border border-ruuvi-border'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Name Field */}
            <div className="space-y-1">
                <label className={labelClasses}>Name</label>
                <input
                    type="text"
                    value={tagName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="e.g., Living Room, Sauna, Outdoor"
                    className={inputClasses}
                />
                <p className="text-xs text-ruuvi-text-muted/70">Custom name for this tag (appears in MQTT payload)</p>
            </div>

            {/* Tag Information */}
            <div className="border-t border-ruuvi-border pt-4">
                <h4 className="text-sm font-bold text-ruuvi-text mb-3">Tag Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="text-ruuvi-text-muted">MAC Address</div>
                        <div className="font-mono font-medium text-ruuvi-text">{tag.mac}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-ruuvi-text-muted">Data Format</div>
                        <div className="font-medium text-ruuvi-text">v{tag.data_format}</div>
                    </div>
                </div>
            </div>

            {/* Current Readings */}
            <div className="border-t border-ruuvi-border pt-4">
                <h4 className="text-sm font-bold text-ruuvi-text mb-3">Current Readings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                        <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Temperature</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-ruuvi-text">
                                {tag.temperature?.toFixed(2) ?? '--'}
                            </span>
                            <span className="text-xs font-normal text-ruuvi-text-muted">°C</span>
                        </div>
                    </div>
                    <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                        <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Humidity</div>
                        <div className="text-xl font-bold text-ruuvi-text">
                            {tag.humidity?.toFixed(2) ?? '--'} <span className="text-sm font-normal text-ruuvi-text-muted">%</span>
                        </div>
                    </div>
                    <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                        <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Pressure</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-ruuvi-text">
                                {tag.pressure ? (tag.pressure / 100).toFixed(1) : '--'}
                            </span>
                            <span className="text-xs font-normal text-ruuvi-text-muted">hPa</span>
                        </div>
                    </div>
                    <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                        <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Battery</div>
                        <div className="text-xl font-bold text-ruuvi-text">
                            {tag.battery_voltage ? (tag.battery_voltage / 1000).toFixed(2) : '--'} <span className="text-sm font-normal text-ruuvi-text-muted">V</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Air Quality Readings (Data Format 6) */}
            {tag.data_format === 6 && (
                <div className="border-t border-ruuvi-border pt-4">
                    <h4 className="text-sm font-bold text-ruuvi-text mb-3">Air Quality Readings</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {tag.air_quality_index !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-success/30 col-span-2 transition-colors duration-250">
                                <div className="text-ruuvi-success text-xs uppercase tracking-wide font-bold">Air Quality Index</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-ruuvi-text">
                                        {tag.air_quality_index.toFixed(0)}
                                    </span>
                                    <span className="text-lg font-normal text-ruuvi-text-muted">/ 100</span>
                                </div>
                            </div>
                        )}
                        {tag.pm2p5 !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">PM2.5</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-ruuvi-text">
                                        {tag.pm2p5.toFixed(1)}
                                    </span>
                                    <span className="text-sm font-normal text-ruuvi-text-muted">µg/m³</span>
                                </div>
                            </div>
                        )}
                        {tag.co2 !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">CO2</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-ruuvi-text">
                                        {tag.co2.toFixed(0)}
                                    </span>
                                    <span className="text-sm font-normal text-ruuvi-text-muted">ppm</span>
                                </div>
                            </div>
                        )}
                        {tag.voc !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">VOC Index</div>
                                <div className="text-xl font-bold text-ruuvi-text">
                                    {tag.voc.toFixed(0)}
                                </div>
                            </div>
                        )}
                        {tag.nox !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">NOX Index</div>
                                <div className="text-xl font-bold text-ruuvi-text">
                                    {tag.nox.toFixed(0)}
                                </div>
                            </div>
                        )}
                        {tag.illuminance !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Illuminance</div>
                                <div className="text-xl font-bold text-ruuvi-text">
                                    {tag.illuminance.toFixed(0)} <span className="text-sm font-normal text-ruuvi-text-muted">lux</span>
                                </div>
                            </div>
                        )}
                        {tag.sound_average !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-border transition-colors duration-250">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Sound (Avg)</div>
                                <div className="text-xl font-bold text-ruuvi-text">
                                    {tag.sound_average.toFixed(1)} <span className="text-sm font-normal text-ruuvi-text-muted">dB</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Additional Details */}
            <div className="border-t border-ruuvi-border pt-4">
                <h4 className="text-sm font-bold text-ruuvi-text mb-3">Diagnostics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="text-ruuvi-text-muted">Signal (RSSI)</div>
                        <div className="font-medium text-ruuvi-text">{tag.rssi} dBm</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-ruuvi-text-muted">TX Power</div>
                        <div className="font-medium text-ruuvi-text">{tag.tx_power ?? '--'} dBm</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-ruuvi-text-muted">Movement</div>
                        <div className="font-medium text-ruuvi-text">{tag.movement_counter ?? '--'}</div>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <div className="text-ruuvi-text-muted">Last Seen</div>
                        <div className="font-medium text-ruuvi-text">
                            {new Date(tag.last_seen * 1000).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
