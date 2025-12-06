import { InfluxDBPublisherConfig } from '@/types';

interface InfluxDBFormProps {
    initialConfig?: InfluxDBPublisherConfig;
    onChange: (config: InfluxDBPublisherConfig) => void;
}

export function InfluxDBForm({ initialConfig, onChange }: InfluxDBFormProps) {
    const defaultConfig: InfluxDBPublisherConfig = {
        enabled: true,
        url: 'http://localhost:8086',
        auth_token: '',
        org: 'my-org',
        bucket: 'ruuvi',
        measurement: 'ruuvi_measurements',
        minimum_interval: '1s'
    };

    const config = initialConfig || defaultConfig;

    const handleChange = (field: keyof InfluxDBPublisherConfig, value: any) => {
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
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">Enable InfluxDB Publisher</label>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">URL</label>
                <input
                    type="text"
                    value={config.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                    placeholder="http://localhost:8086"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Auth Token</label>
                <input
                    type="password"
                    value={config.auth_token}
                    onChange={(e) => handleChange('auth_token', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Organization</label>
                    <input
                        type="text"
                        value={config.org}
                        onChange={(e) => handleChange('org', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Bucket</label>
                    <input
                        type="text"
                        value={config.bucket}
                        onChange={(e) => handleChange('bucket', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Measurement</label>
                    <input
                        type="text"
                        value={config.measurement}
                        onChange={(e) => handleChange('measurement', e.target.value)}
                        placeholder="ruuvi_measurements"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
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
            </div>
        </div>
    );
}
