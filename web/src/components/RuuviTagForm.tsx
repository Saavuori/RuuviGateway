import { Tag } from '@/types';

interface RuuviTagFormProps {
    tag: Tag;
    tagName: string;
    enabled: boolean;
    onNameChange: (name: string) => void;
    onEnabledChange: (enabled: boolean) => void;
}

interface Tag3DProps {
    x: number;
    y: number;
    z: number;
}

function Tag3D({ x, y, z }: Tag3DProps) {
    // Calculate Pitch (rotation about X) and Roll (rotation about Y)
    // We assume Z is normal to the tag surface, X is "up/down" on the tag, Y is "left/right"
    const pitch = Math.atan2(y, z) * (180 / Math.PI);
    const roll = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);

    return (
        <div className="relative w-32 h-32 [perspective:800px] flex items-center justify-center">
            {/* The Tag Model */}
            <div 
                className="w-28 h-28 relative [transform-style:preserve-3d] transition-transform duration-700 ease-out"
                style={{ 
                    transform: `rotateX(${pitch}deg) rotateY(${roll}deg)` 
                }}
            >
                {/* Front Face (Top of RuuviTag) */}
                <div className="absolute inset-0 rounded-full bg-ruuvi-input-bg border-[3px] border-ruuvi-border shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center [backface-visibility:hidden] [transform:translateZ(6px)]">
                    <div className="w-20 h-20 rounded-full border border-ruuvi-success/20 flex flex-col items-center justify-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-ruuvi-success/20 animate-pulse" />
                        <span className="text-[6px] text-ruuvi-text-muted font-bold tracking-widest uppercase">Ruuvi</span>
                    </div>
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-full" />
                </div>

                {/* Side/Thickness (using multiple layers for depth) */}
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute inset-0 rounded-full border-[3px] border-ruuvi-border/40"
                        style={{ transform: `translateZ(${i}px)` }}
                    />
                ))}

                {/* Back Face */}
                <div className="absolute inset-0 rounded-full bg-ruuvi-toggle-bg border-[3px] border-ruuvi-border [backface-visibility:hidden] [transform:rotateY(180deg) translateZ(0)]" />
                
                {/* Directional Indicator (Small notch/arrow for "up") */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-ruuvi-success/50 rounded-full [transform:translateZ(7px)]" />
            </div>

            {/* Ambient Shadow on floor */}
            <div 
                className="absolute inset-x-8 bottom-0 h-4 bg-black/40 blur-xl rounded-full transition-transform duration-700 ease-out"
                style={{
                    transform: `translateX(${-roll/2}px) scaleX(${1 + Math.abs(pitch)/90})`
                }}
            />
        </div>
    );
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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

            {/* Advanced Environmental (Calculated) */}
            {(tag.dew_point !== undefined || tag.absolute_humidity !== undefined || tag.air_density !== undefined) && (
                <div className="border-t border-ruuvi-border pt-4">
                    <h4 className="text-sm font-bold text-ruuvi-text mb-3">Secondary Environment</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        {tag.dew_point !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg/50 rounded-lg border border-ruuvi-border">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Dew Point</div>
                                <div className="text-lg font-bold text-ruuvi-text">{tag.dew_point.toFixed(2)} <span className="text-xs font-normal text-ruuvi-text-muted">°C</span></div>
                            </div>
                        )}
                        {tag.absolute_humidity !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg/50 rounded-lg border border-ruuvi-border">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Abs. Humidity</div>
                                <div className="text-lg font-bold text-ruuvi-text">{tag.absolute_humidity.toFixed(2)} <span className="text-xs font-normal text-ruuvi-text-muted">g/m³</span></div>
                            </div>
                        )}
                        {tag.air_density !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg/50 rounded-lg border border-ruuvi-border">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Air Density</div>
                                <div className="text-lg font-bold text-ruuvi-text">{tag.air_density.toFixed(3)} <span className="text-xs font-normal text-ruuvi-text-muted">kg/m³</span></div>
                            </div>
                        )}
                        {tag.equilibrium_vapor_pressure !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg/50 rounded-lg border border-ruuvi-border">
                                <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Vapor Pres.</div>
                                <div className="text-lg font-bold text-ruuvi-text">{(tag.equilibrium_vapor_pressure / 100).toFixed(2)} <span className="text-xs font-normal text-ruuvi-text-muted">hPa</span></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Acceleration */}
            {(tag.acceleration_x !== undefined || tag.acceleration_total !== undefined) && (
                <div className="border-t border-ruuvi-border pt-4">
                    <h4 className="text-sm font-bold text-ruuvi-text mb-3">Motion & Orientation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* 3D Visual */}
                        <div className="relative py-8 flex flex-col items-center justify-center bg-black/10 rounded-xl border border-ruuvi-border/30 overflow-hidden">
                            <div className="absolute inset-0 bg-radial-gradient from-ruuvi-success/5 via-transparent to-transparent opacity-50" />
                            <Tag3D
                                x={tag.acceleration_x ?? 0}
                                y={tag.acceleration_y ?? 0}
                                z={tag.acceleration_z ?? 1}
                            />
                            <div className="mt-8 flex gap-4 text-[10px] items-center text-ruuvi-text-muted font-mono bg-ruuvi-input-bg/80 px-3 py-1 rounded-full border border-ruuvi-border/50">
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> X: {(tag.acceleration_x ?? 0).toFixed(2)}</span>
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500/50" /> Y: {(tag.acceleration_y ?? 0).toFixed(2)}</span>
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" /> Z: {(tag.acceleration_z ?? 0).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {tag.acceleration_total !== undefined && (
                                <div className="p-3 bg-ruuvi-input-bg/50 rounded-lg border border-ruuvi-border">
                                    <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Total Accel.</div>
                                    <div className="text-lg font-bold text-ruuvi-text">{tag.acceleration_total.toFixed(3)} <span className="text-xs font-normal text-ruuvi-text-muted">G</span></div>
                                </div>
                            )}
                            {tag.acceleration_x !== undefined && (
                                <div className="p-3 bg-ruuvi-input-bg/50 rounded-lg border border-ruuvi-border">
                                    <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">X-Axis</div>
                                    <div className="text-lg font-bold text-ruuvi-text">{tag.acceleration_x.toFixed(3)} <span className="text-xs font-normal text-ruuvi-text-muted">G</span></div>
                                </div>
                            )}
                            {tag.acceleration_y !== undefined && (
                                <div className="p-3 bg-ruuvi-input-bg/50 rounded-lg border border-ruuvi-border">
                                    <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Y-Axis</div>
                                    <div className="text-lg font-bold text-ruuvi-text">{tag.acceleration_y.toFixed(3)} <span className="text-xs font-normal text-ruuvi-text-muted">G</span></div>
                                </div>
                            )}
                            {tag.acceleration_z !== undefined && (
                                <div className="p-3 bg-ruuvi-input-bg/50 rounded-lg border border-ruuvi-border">
                                    <div className="text-ruuvi-text-muted text-xs uppercase tracking-wide">Z-Axis</div>
                                    <div className="text-lg font-bold text-ruuvi-text">{tag.acceleration_z.toFixed(3)} <span className="text-xs font-normal text-ruuvi-text-muted">G</span></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Air Quality Readings (Data Format 6) */}
            {tag.data_format === 6 && (
                <div className="border-t border-ruuvi-border pt-4">
                    <h4 className="text-sm font-bold text-ruuvi-text mb-3">Air Quality Readings</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        {tag.air_quality_index !== undefined && (
                            <div className="p-3 bg-ruuvi-input-bg rounded-lg border border-ruuvi-success/30 col-span-full transition-colors duration-250">
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
                <h4 className="text-sm font-bold text-ruuvi-text mb-3">Diagnostics & Device</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
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
                    <div className="space-y-1">
                        <div className="text-ruuvi-text-muted">Seq. Number</div>
                        <div className="font-medium text-ruuvi-text">{tag.measurement_sequence_number ?? '--'}</div>
                    </div>
                    {tag.calibration_in_progress !== undefined && (
                        <div className="space-y-1">
                            <div className="text-ruuvi-text-muted">Calibrating</div>
                            <div className={`font-medium ${tag.calibration_in_progress ? 'text-ruuvi-success' : 'text-ruuvi-text'}`}>
                                {tag.calibration_in_progress ? 'In Progress' : 'No'}
                            </div>
                        </div>
                    )}
                    {tag.button_pressed_on_boot !== undefined && (
                        <div className="space-y-1">
                            <div className="text-ruuvi-text-muted">Boot Button</div>
                            <div className="font-medium text-ruuvi-text">{tag.button_pressed_on_boot ? 'Pressed' : 'No'}</div>
                        </div>
                    )}
                    <div className="space-y-1 col-span-full">
                        <div className="text-ruuvi-text-muted">Last Seen</div>
                        <div className="font-medium text-ruuvi-text">
                            {new Date(tag.last_seen).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
