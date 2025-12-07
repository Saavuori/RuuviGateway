import { LucideIcon, Pencil, Thermometer, Droplets, Gauge, Zap, Signal, Battery, Sun, Activity } from 'lucide-react';

interface IntegrationCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    status?: 'active' | 'inactive' | 'new';
    onConfigure?: () => void;
    onIgnore?: () => void;
    configureLabel?: string;
    onEdit?: () => void;
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
    };
    subtitle?: string;
}

export function IntegrationCard({
    title,
    description,
    icon: Icon,
    status,
    onConfigure,
    onIgnore,
    configureLabel,
    onEdit,
    sensors,
    subtitle
}: IntegrationCardProps) {
    const buttonLabel = configureLabel || (status === 'new' ? 'Add' : 'Configure');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-auto hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-full shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 leading-tight">{title}</h3>
                        {(subtitle || description) && (
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{subtitle || description}</p>
                        )}
                    </div>
                </div>
                {status && (
                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full ${status === 'active' ? 'bg-green-100 text-green-700' :
                        status === 'new' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {status}
                    </span>
                )}
            </div>

            {/* Sensor Grid (Only if sensors provided) */}
            {sensors && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">
                            {sensors.temperature?.toFixed(1) ?? '--'}°C
                        </span>
                    </div>
                    <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">
                            {sensors.humidity?.toFixed(1) ?? '--'}%
                        </span>
                    </div>
                    {sensors.pressure && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {(sensors.pressure / 100).toFixed(0)} hPa
                            </span>
                        </div>
                    )}
                    <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                        <Signal className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                            {sensors.rssi} dBm
                        </span>
                    </div>

                    {/* Extended Sensors */}
                    {sensors.pm2p5 !== undefined && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2 col-span-2 sm:col-span-1">
                            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-400 rounded-sm">PM</span>
                            <span className="text-sm font-medium text-gray-700">
                                {sensors.pm2p5.toFixed(1)} µg/m³
                            </span>
                        </div>
                    )}
                    {sensors.co2 !== undefined && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-green-600 border border-green-600 rounded-sm">CO2</span>
                            <span className="text-sm font-medium text-gray-700">
                                {sensors.co2.toFixed(0)} ppm
                            </span>
                        </div>
                    )}
                    {sensors.voc !== undefined && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-orange-500 border border-orange-500 rounded-sm">VOC</span>
                            <span className="text-sm font-medium text-gray-700">
                                {sensors.voc.toFixed(0)}
                            </span>
                        </div>
                    )}
                    {sensors.nox !== undefined && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-red-500 border border-red-500 rounded-sm">NOX</span>
                            <span className="text-sm font-medium text-gray-700">
                                {sensors.nox.toFixed(0)}
                            </span>
                        </div>
                    )}
                    {sensors.illuminance !== undefined && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                            <Sun className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {sensors.illuminance.toFixed(0)} lx
                            </span>
                        </div>
                    )}
                    {sensors.voltage !== undefined && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                            <Battery className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">
                                {sensors.voltage.toFixed(2)} V
                            </span>
                        </div>
                    )}
                    {sensors.sound_average !== undefined && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-blue-500">dB</span>
                            <span className="text-sm font-medium text-gray-700">
                                {sensors.sound_average.toFixed(1)} dB
                            </span>
                        </div>
                    )}
                    {sensors.movement_counter !== undefined && (
                        <div className="bg-gray-50 rounded p-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">
                                #{sensors.movement_counter}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Description (Fallback if no sensors) */}
            {!sensors && description && !subtitle && (
                <p className="text-sm text-gray-600 mb-4 flex-grow">{description}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end items-center gap-2 mt-auto pt-2 border-t border-gray-100">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit name"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
                {onConfigure && (
                    <button
                        onClick={onConfigure}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        {buttonLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

