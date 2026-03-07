import { LucideIcon, Pencil, Thermometer, Droplets, Gauge, Signal, Battery, Sun, Activity } from 'lucide-react';

interface IntegrationCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    status?: 'active' | 'inactive' | 'new';
    onConfigure?: () => void;
    onIgnore?: () => void;
    configureLabel?: string;
    onEdit?: () => void;
    dataFormat?: number;
    sensors?: {
        temperature?: number;
        humidity?: number;
        pressure?: number;
        voltage?: number;
        rssi?: number;
        pm2p5?: number;
        co2?: number;
        voc?: number;
        nox?: number;
        illuminance?: number;
        sound_average?: number;
        movement_counter?: number;
        air_quality_index?: number;
    };
    subtitle?: string;
    lastSeen?: number;
    // Toggle props for RuuviTags
    isEnabled?: boolean;
    onToggleEnabled?: (enabled: boolean) => void;
}

export function IntegrationCard({
    title,
    description,
    icon: Icon,
    status,
    onConfigure,
    configureLabel,
    onEdit,
    dataFormat,
    sensors,
    subtitle,
    lastSeen,
    isEnabled,
    onToggleEnabled
}: IntegrationCardProps) {
    const isRuuviTag = !!sensors;
    const buttonLabel = configureLabel || (status === 'new' ? 'Add' : 'Configure');

    // Use calculated AQI if available, otherwise fallback or hide
    const aqi = sensors?.air_quality_index;

    // Calculate time ago (lastSeen is in milliseconds from backend)
    const now = Date.now();
    const timeAgo = lastSeen ? Math.floor((now - lastSeen) / 1000) : null;
    const isStale = timeAgo !== null && timeAgo > 60;

    let displayTime = null;
    if (lastSeen && timeAgo !== null) {
        displayTime = `${timeAgo} Seconds ago`;
    }

    return (
        <div className="bg-ruuvi-card rounded-xl shadow-lg border border-ruuvi-border p-4 flex flex-col h-auto hover:shadow-xl transition-shadow relative overflow-hidden w-72 transition-colors duration-250">
            {/* Header: Bluetooth icon + (Name / MAC stack) */}
            <div className="flex items-start gap-3 mb-3 z-10 relative">
                <div className="p-2 bg-ruuvi-input-bg rounded-full shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-ruuvi-success" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-base text-ruuvi-text leading-tight truncate flex-1">{title}</h3>
                        {/* Pencil edit icon — stays close to name */}
                        {isRuuviTag && onConfigure && (
                            <button
                                onClick={onConfigure}
                                className="p-1 text-ruuvi-text-muted hover:text-ruuvi-text hover:bg-ruuvi-input-bg rounded transition-colors shrink-0"
                                title="Edit tag settings"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {(subtitle || description) && (
                            <p className="text-[11px] text-ruuvi-text-muted font-mono truncate flex-1 min-w-0">{subtitle || description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Status badge for sinks (shown inline near header) */}
            {!isRuuviTag && status && (
                <div className="absolute top-4 right-4">
                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full ${status === 'active' ? 'bg-ruuvi-success/20 text-ruuvi-success' :
                        status === 'new' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-700 text-gray-400'
                        }`}>
                        {status}
                    </span>
                </div>
            )}

            {/* Sensor Grid (Only if sensors provided) */}
            {sensors && (
                <div className="flex flex-col gap-2 z-10 relative">

                    {/* Data Format 6 (Air Quality Sensor): Show only PM2.5 and CO2 */}
                    {dataFormat === 6 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {/* Air Quality - double wide */}
                            {aqi !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col col-span-2 border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] font-bold text-ruuvi-success border border-ruuvi-success px-1 rounded-sm leading-none">AQI</span>
                                            <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider leading-none">Air Quality</span>
                                        </div>
                                        <div className="h-1.5 w-16 bg-ruuvi-toggle-bg rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${aqi > 80 ? 'bg-ruuvi-success' : aqi > 50 ? 'bg-ruuvi-accent' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(100, aqi)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {aqi.toFixed(0)}
                                        </span>
                                        <span className="text-[10px] font-medium text-ruuvi-text-muted">/ 100</span>
                                    </div>
                                </div>
                            )}
                            {sensors.pm2p5 !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold text-ruuvi-text-muted border border-ruuvi-text-muted px-1 rounded-sm">PM</span>
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">PM2.5</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {sensors.pm2p5.toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-ruuvi-text-muted font-normal">µg/m³</span>
                                    </div>
                                </div>
                            )}
                            {sensors.co2 !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold text-ruuvi-success border border-ruuvi-success px-1 rounded-sm">CO2</span>
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">CO2</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {sensors.co2.toFixed(0)}
                                        </span>
                                        <span className="text-[10px] text-ruuvi-text-muted font-normal">ppm</span>
                                    </div>
                                </div>
                            )}
                            <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Thermometer className="w-3.5 h-3.5 text-ruuvi-text-muted" />
                                    <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Temp</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-base font-bold text-ruuvi-text">
                                        {sensors.temperature?.toFixed(1) ?? '--'}
                                    </span>
                                    <span className="text-[10px] text-ruuvi-text-muted font-normal">°C</span>
                                </div>
                            </div>
                            <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Droplets className="w-3.5 h-3.5 text-ruuvi-text-muted" />
                                    <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Humidity</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-base font-bold text-ruuvi-text">
                                        {sensors.humidity?.toFixed(1) ?? '--'}
                                    </span>
                                    <span className="text-[10px] text-ruuvi-text-muted font-normal">%</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Standard sensors for other data formats */
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Thermometer className="w-3.5 h-3.5 text-ruuvi-text-muted" />
                                    <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Temp</span>
                                </div>
                                <span className="text-base font-bold text-ruuvi-text">
                                    {sensors.temperature?.toFixed(1) ?? '--'} <span className="text-xs font-normal text-ruuvi-text-muted">°C</span>
                                </span>
                            </div>
                            <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Droplets className="w-3.5 h-3.5 text-ruuvi-text-muted" />
                                    <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Humidity</span>
                                </div>
                                <span className="text-base font-bold text-ruuvi-text">
                                    {sensors.humidity?.toFixed(1) ?? '--'} <span className="text-xs font-normal text-ruuvi-text-muted">%</span>
                                </span>
                            </div>
                            {sensors.pressure && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col col-span-2 sm:col-span-1 border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Gauge className="w-3.5 h-3.5 text-ruuvi-text-muted" />
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Pressure</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {(sensors.pressure / 100).toFixed(0)}
                                        </span>
                                        <span className="text-[10px] text-ruuvi-text-muted font-normal">hPa</span>
                                    </div>
                                </div>
                            )}
                            <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col col-span-2 sm:col-span-1 border border-ruuvi-border transition-colors duration-250">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Signal className="w-3.5 h-3.5 text-ruuvi-text-muted" />
                                    <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">RSSI</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-base font-bold text-ruuvi-text">
                                        {sensors.rssi}
                                    </span>
                                    <span className="text-[10px] text-ruuvi-text-muted font-normal">dBm</span>
                                </div>
                            </div>

                            {/* Extended Sensors */}
                            {sensors.pm2p5 !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col col-span-2 sm:col-span-1 border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold text-ruuvi-text-muted border border-ruuvi-text-muted px-1 rounded-sm">PM</span>
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">PM2.5</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {sensors.pm2p5.toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-ruuvi-text-muted font-normal">µg/m³</span>
                                    </div>
                                </div>
                            )}
                            {sensors.co2 !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold text-ruuvi-success border border-ruuvi-success px-1 rounded-sm">CO2</span>
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">CO2</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {sensors.co2.toFixed(0)}
                                        </span>
                                        <span className="text-[10px] text-ruuvi-text-muted font-normal">ppm</span>
                                    </div>
                                </div>
                            )}
                            {sensors.voc !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold text-ruuvi-accent border border-ruuvi-accent px-1 rounded-sm">VOC</span>
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Index</span>
                                    </div>
                                    <span className="text-base font-bold text-ruuvi-text">
                                        {sensors.voc.toFixed(0)}
                                    </span>
                                </div>
                            )}
                            {sensors.nox !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold text-red-500 border border-red-500 px-1 rounded-sm">NOX</span>
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Index</span>
                                    </div>
                                    <span className="text-base font-bold text-ruuvi-text">
                                        {sensors.nox.toFixed(0)}
                                    </span>
                                </div>
                            )}
                            {sensors.illuminance !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Sun className="w-3.5 h-3.5 text-ruuvi-accent" />
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Light</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {sensors.illuminance.toFixed(0)}
                                        </span>
                                        <span className="text-[10px] text-ruuvi-text-muted font-normal">lx</span>
                                    </div>
                                </div>
                            )}
                            {sensors.voltage !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Battery className="w-3.5 h-3.5 text-ruuvi-success" />
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Battery</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {sensors.voltage.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-ruuvi-text-muted font-normal">V</span>
                                    </div>
                                </div>
                            )}
                            {sensors.movement_counter !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Activity className="w-3.5 h-3.5 text-ruuvi-accent" />
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Moves</span>
                                    </div>
                                    <span className="text-base font-bold text-ruuvi-text">
                                        #{sensors.movement_counter}
                                    </span>
                                </div>
                            )}
                            {sensors.sound_average !== undefined && (
                                <div className="bg-ruuvi-input-bg rounded-lg p-2 flex flex-col border border-ruuvi-border transition-colors duration-250">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold text-blue-500">dB</span>
                                        <span className="text-[10px] text-ruuvi-text-muted uppercase tracking-wider">Sound</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-bold text-ruuvi-text">
                                            {sensors.sound_average.toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-ruuvi-text-muted font-normal">dB</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Description (Fallback if no sensors) */}
            {!sensors && description && !subtitle && (
                <p className="text-sm text-ruuvi-text-muted mb-4 flex-grow z-10 relative">{description}</p>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center gap-2 mt-auto pt-2 border-t border-ruuvi-border z-10 relative">
                {/* Toggle for RuuviTags in footer */}
                {isRuuviTag && onToggleEnabled ? (
                    <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ruuvi-text-muted leading-none mb-1">Status</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-ruuvi-text leading-none">{isEnabled ? 'Enabled' : 'Disabled'}</span>
                                <button
                                    onClick={() => onToggleEnabled(!isEnabled)}
                                    className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ruuvi-success focus:ring-offset-2 focus:ring-offset-ruuvi-card ${isEnabled ? 'bg-ruuvi-success' : 'bg-ruuvi-toggle-bg border border-ruuvi-border'
                                        }`}
                                    role="switch"
                                    aria-checked={isEnabled}
                                    title={isEnabled ? 'Disable tag' : 'Enable tag'}
                                >
                                    <span
                                        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-4' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {displayTime && (
                            <div className="flex flex-col border-l border-ruuvi-border pl-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-ruuvi-text-muted leading-none mb-1">Last Seen</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${!isStale ? 'bg-ruuvi-success animate-pulse' : 'bg-ruuvi-text-muted'}`} />
                                    <span className="text-[10px] text-ruuvi-text font-medium uppercase tracking-wide whitespace-nowrap">
                                        {displayTime}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : <span />}
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-ruuvi-text-muted hover:text-ruuvi-text hover:bg-ruuvi-input-bg rounded-lg transition-colors"
                        title="Edit name"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
                {/* For sinks: text configure button */}
                {onConfigure && !isRuuviTag && (
                    <button
                        onClick={onConfigure}
                        className="text-sm font-medium text-ruuvi-success hover:text-ruuvi-success/80 transition-colors"
                    >
                        {buttonLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
