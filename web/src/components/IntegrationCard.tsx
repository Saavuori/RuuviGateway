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
        <div className="bg-ruuvi-card rounded-xl shadow-lg border border-transparent p-5 flex flex-col h-auto hover:shadow-xl transition-shadow relative overflow-hidden w-80">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 z-10 relative">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-ruuvi-dark/50 rounded-full shrink-0">
                        <Icon className="w-6 h-6 text-ruuvi-success" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-lg text-ruuvi-text leading-tight">{title}</h3>
                            {/* Edit icon next to name for RuuviTags */}
                            {isRuuviTag && onConfigure && (
                                <button
                                    onClick={onConfigure}
                                    className="p-1 text-ruuvi-text-muted hover:text-white hover:bg-ruuvi-dark/50 rounded transition-colors"
                                    title="Edit tag settings"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        {(subtitle || description) && (
                            <p className="text-xs text-ruuvi-text-muted font-mono mt-0.5">{subtitle || description}</p>
                        )}
                        {displayTime && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${!isStale ? 'bg-ruuvi-success animate-pulse' : 'bg-ruuvi-text-muted'}`} />
                                <span className="text-[10px] text-ruuvi-text-muted font-medium uppercase tracking-wide">
                                    {displayTime}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Toggle for RuuviTags, Status Badge for Sinks */}
                {isRuuviTag && onToggleEnabled ? (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => onToggleEnabled(!isEnabled)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ruuvi-success focus:ring-offset-2 focus:ring-offset-ruuvi-card ${isEnabled ? 'bg-ruuvi-success' : 'bg-gray-600'
                                }`}
                            role="switch"
                            aria-checked={isEnabled}
                            title={isEnabled ? 'Disable tag' : 'Enable tag'}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>
                ) : status && (
                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full ${status === 'active' ? 'bg-ruuvi-success/20 text-ruuvi-success' :
                        status === 'new' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-700 text-gray-400'
                        }`}>
                        {status}
                    </span>
                )}
            </div>

            {/* Sensor Grid (Only if sensors provided) */}
            {sensors && (
                <div className="flex flex-col gap-3 z-10 relative">

                    {/* Data Format 6 (Air Quality Sensor): Show only PM2.5 and CO2 */}
                    {dataFormat === 6 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {/* Air Quality - double wide */}
                            {aqi !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col col-span-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-ruuvi-success border border-ruuvi-success px-1 rounded-sm">AQI</span>
                                            <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Air Quality</span>
                                        </div>
                                        <div className="h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${aqi > 80 ? 'bg-ruuvi-success' : aqi > 50 ? 'bg-ruuvi-accent' : 'bg-red-400'}`}
                                                style={{ width: `${Math.min(100, aqi)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {aqi.toFixed(0)} <span className="text-xs font-normal text-ruuvi-text-muted">/ 100</span>
                                    </span>
                                </div>
                            )}
                            {sensors.pm2p5 !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-ruuvi-text-muted border border-ruuvi-text-muted px-1 rounded-sm">PM</span>
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">PM2.5</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.pm2p5.toFixed(1)} <span className="text-xs font-normal text-ruuvi-text-muted">µg/m³</span>
                                    </span>
                                </div>
                            )}
                            {sensors.co2 !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-ruuvi-success border border-ruuvi-success px-1 rounded-sm">CO2</span>
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">CO2</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.co2.toFixed(0)} <span className="text-xs font-normal text-ruuvi-text-muted">ppm</span>
                                    </span>
                                </div>
                            )}
                            <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <Thermometer className="w-4 h-4 text-ruuvi-text-muted" />
                                    <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Temp</span>
                                </div>
                                <span className="text-lg font-bold text-white">
                                    {sensors.temperature?.toFixed(1) ?? '--'} <span className="text-xs font-normal text-ruuvi-text-muted">°C</span>
                                </span>
                            </div>
                            <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <Droplets className="w-4 h-4 text-ruuvi-text-muted" />
                                    <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Humidity</span>
                                </div>
                                <span className="text-lg font-bold text-white">
                                    {sensors.humidity?.toFixed(1) ?? '--'} <span className="text-xs font-normal text-ruuvi-text-muted">%</span>
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* Standard sensors for other data formats */
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <Thermometer className="w-4 h-4 text-ruuvi-text-muted" />
                                    <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Temp</span>
                                </div>
                                <span className="text-xl font-bold text-white">
                                    {sensors.temperature?.toFixed(1) ?? '--'} <span className="text-sm font-normal text-ruuvi-text-muted">°C</span>
                                </span>
                            </div>
                            <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <Droplets className="w-4 h-4 text-ruuvi-text-muted" />
                                    <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Humidity</span>
                                </div>
                                <span className="text-xl font-bold text-white">
                                    {sensors.humidity?.toFixed(1) ?? '--'} <span className="text-sm font-normal text-ruuvi-text-muted">%</span>
                                </span>
                            </div>
                            {sensors.pressure && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col col-span-2 sm:col-span-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Gauge className="w-4 h-4 text-ruuvi-text-muted" />
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Pressure</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {(sensors.pressure / 100).toFixed(0)} <span className="text-xs font-normal text-ruuvi-text-muted">hPa</span>
                                    </span>
                                </div>
                            )}
                            <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col col-span-2 sm:col-span-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Signal className="w-4 h-4 text-ruuvi-text-muted" />
                                    <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">RSSI</span>
                                </div>
                                <span className="text-lg font-bold text-white">
                                    {sensors.rssi} <span className="text-xs font-normal text-ruuvi-text-muted">dBm</span>
                                </span>
                            </div>

                            {/* Extended Sensors */}
                            {sensors.pm2p5 !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col col-span-2 sm:col-span-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-ruuvi-text-muted border border-ruuvi-text-muted px-1 rounded-sm">PM</span>
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">PM2.5</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.pm2p5.toFixed(1)} <span className="text-xs font-normal text-ruuvi-text-muted">µg/m³</span>
                                    </span>
                                </div>
                            )}
                            {sensors.co2 !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-ruuvi-success border border-ruuvi-success px-1 rounded-sm">CO2</span>
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">CO2</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.co2.toFixed(0)} <span className="text-xs font-normal text-ruuvi-text-muted">ppm</span>
                                    </span>
                                </div>
                            )}
                            {sensors.voc !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-orange-400 border border-orange-400 px-1 rounded-sm">VOC</span>
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Index</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.voc.toFixed(0)}
                                    </span>
                                </div>
                            )}
                            {sensors.nox !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-red-400 border border-red-400 px-1 rounded-sm">NOX</span>
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Index</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.nox.toFixed(0)}
                                    </span>
                                </div>
                            )}
                            {sensors.illuminance !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sun className="w-4 h-4 text-ruuvi-accent" />
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Light</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.illuminance.toFixed(0)} <span className="text-xs font-normal text-ruuvi-text-muted">lx</span>
                                    </span>
                                </div>
                            )}
                            {sensors.voltage !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Battery className="w-4 h-4 text-ruuvi-success" />
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Battery</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.voltage.toFixed(2)} <span className="text-xs font-normal text-ruuvi-text-muted">V</span>
                                    </span>
                                </div>
                            )}
                            {sensors.movement_counter !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Moves</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        #{sensors.movement_counter}
                                    </span>
                                </div>
                            )}
                            {sensors.sound_average !== undefined && (
                                <div className="bg-ruuvi-dark/30 rounded-lg p-3 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-blue-400">dB</span>
                                        <span className="text-xs text-ruuvi-text-muted uppercase tracking-wider">Sound</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {sensors.sound_average.toFixed(1)} <span className="text-xs font-normal text-ruuvi-text-muted">dB</span>
                                    </span>
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
            <div className="flex justify-end items-center gap-2 mt-auto pt-2 border-t border-ruuvi-dark/50 z-10 relative">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-ruuvi-text-muted hover:text-white hover:bg-ruuvi-dark rounded-lg transition-colors"
                        title="Edit name"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
                {/* For sinks: text button (RuuviTags have edit in header now) */}
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
