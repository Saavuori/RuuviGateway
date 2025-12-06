import { MQTTPublisherConfig } from '@/types';

interface MQTTFormProps {
    initialConfig?: MQTTPublisherConfig;
    onChange: (config: MQTTPublisherConfig) => void;
}

export function MQTTForm({ initialConfig, onChange }: MQTTFormProps) {
    const defaultConfig: MQTTPublisherConfig = {
        enabled: true,
        broker_url: 'tcp://localhost:1883',
        topic_prefix: 'ruuvi_measurements',
        client_id: 'ruuvi-bridge',
        minimum_interval: '1s',
        username: '',
        password: '',
        homeassistant_discovery_prefix: 'homeassistant'
    };

    const config = initialConfig || defaultConfig;

    const handleChange = (field: keyof MQTTPublisherConfig, value: any) => {
        onChange({ ...config, [field]: value });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="enabled"
                    checked={config.enabled}
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">Enable MQTT Publisher</label>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Broker URL</label>
                <input
                    type="text"
                    value={config.broker_url}
                    onChange={(e) => handleChange('broker_url', e.target.value)}
                    placeholder="tcp://localhost:1883"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Client ID</label>
                    <input
                        type="text"
                        value={config.client_id}
                        onChange={(e) => handleChange('client_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Topic Prefix</label>
                    <input
                        type="text"
                        value={config.topic_prefix}
                        onChange={(e) => handleChange('topic_prefix', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        value={config.username || ''}
                        onChange={(e) => handleChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={config.password || ''}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Minimum Interval</label>
                <input
                    type="text"
                    value={config.minimum_interval}
                    onChange={(e) => handleChange('minimum_interval', e.target.value)}
                    placeholder="1s"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500">e.g., 1s, 500ms</p>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Home Assistant Discovery Prefix</label>
                <input
                    type="text"
                    value={config.homeassistant_discovery_prefix || ''}
                    onChange={(e) => handleChange('homeassistant_discovery_prefix', e.target.value)}
                    placeholder="homeassistant (leave empty to disable)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
            </div>
        </div>
    );
}
