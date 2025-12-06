import { LucideIcon, Pencil, Thermometer, Droplets, Gauge, Zap, Signal } from 'lucide-react';

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

