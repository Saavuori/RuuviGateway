import { Tag } from '@/types';

interface RuuviTagFormProps {
    tag: Tag;
    tagName: string;
    enabled: boolean;
    onNameChange: (name: string) => void;
    onEnabledChange: (enabled: boolean) => void;
}

export function RuuviTagForm({ tag, tagName, enabled, onNameChange, onEnabledChange }: RuuviTagFormProps) {
    return (
        <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                    <div className="font-medium text-gray-900">Enable Tag</div>
                    <div className="text-sm text-gray-500">Forward data from this tag to sinks</div>
                </div>
                <button
                    onClick={() => onEnabledChange(!enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300'
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
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    value={tagName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="e.g., Living Room, Sauna, Outdoor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500">Custom name for this tag (appears in MQTT payload)</p>
            </div>

            {/* Tag Information */}
            <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tag Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="text-gray-500">MAC Address</div>
                        <div className="font-mono font-medium text-gray-900">{tag.mac}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-gray-500">Data Format</div>
                        <div className="font-medium text-gray-900">v{tag.data_format}</div>
                    </div>
                </div>
            </div>

            {/* Current Readings */}
            <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Readings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Temperature</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {tag.temperature?.toFixed(2) ?? '--'} °C
                        </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Humidity</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {tag.humidity?.toFixed(2) ?? '--'} %
                        </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Pressure</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {tag.pressure ? (tag.pressure / 100).toFixed(1) : '--'} hPa
                        </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Battery</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {tag.battery_voltage ? (tag.battery_voltage / 1000).toFixed(2) : '--'} V
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Details */}
            <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Diagnostics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="text-gray-500">Signal (RSSI)</div>
                        <div className="font-medium text-gray-900">{tag.rssi} dBm</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-gray-500">TX Power</div>
                        <div className="font-medium text-gray-900">{tag.tx_power ?? '--'} dBm</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-gray-500">Movement</div>
                        <div className="font-medium text-gray-900">{tag.movement_counter ?? '--'}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-gray-500">Sequence #</div>
                        <div className="font-medium text-gray-900">{tag.measurement_sequence_number ?? '--'}</div>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <div className="text-gray-500">Last Seen</div>
                        <div className="font-medium text-gray-900">
                            {new Date(tag.last_seen).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
