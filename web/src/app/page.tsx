'use client';

import { useEffect, useState } from 'react';
import { fetchConfig, fetchTags, updateConfig, enableTag, restartGateway, setTagName, fetchVersion } from '@/lib/api';
import { Config, Tag, MQTTPublisherConfig, InfluxDBPublisherConfig, InfluxDB3PublisherConfig } from '@/types';
import { IntegrationCard } from '@/components/IntegrationCard';
import { Modal } from '@/components/Modal';
import { MQTTForm } from '@/components/MQTTForm';
import { InfluxDBForm } from '@/components/InfluxDBForm';
import { InfluxDB3Form } from '@/components/InfluxDB3Form';
import { RuuviTagForm } from '@/components/RuuviTagForm';
import { Bluetooth, Cloud, Database, BarChart3, Settings, RefreshCw, LayoutDashboard, SlidersHorizontal, Sun, Moon, Download, Upload } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState<Config | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [version, setVersion] = useState<string>("Unknown");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'configuration'>('dashboard');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSinkId, setActiveSinkId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);

  // Restart Confirmation State
  const [showRestartPrompt, setShowRestartPrompt] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [configChanged, setConfigChanged] = useState(false);

  // Tag Modal State
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagModalName, setTagModalName] = useState('');
  const [tagModalEnabled, setTagModalEnabled] = useState(false);
  const [initialTagName, setInitialTagName] = useState('');
  const [initialTagEnabled, setInitialTagEnabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configData, tagsData, versionData] = await Promise.all([
          fetchConfig(),
          fetchTags(),
          fetchVersion()
        ]);
        setConfig(configData);
        setTags(tagsData);
        setVersion(versionData.version);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(async () => {
      try {
        const tagsData = await fetchTags();
        setTags(tagsData);
      } catch (error) {
        console.error('Error polling tags:', error);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    if (!config || !activeSinkId) return;
    setIsSaving(true);

    try {
      const newConfig = { ...config };
      
      // Merge formData into the corresponding sink config
      if (activeSinkId === 'mqtt_publisher') {
        newConfig.mqtt_publisher = formData;
      } else if (activeSinkId === 'influxdb_publisher') {
        newConfig.influxdb_publisher = formData;
      } else if (activeSinkId === 'influxdb3_publisher') {
        newConfig.influxdb3_publisher = formData;
      } else if (activeSinkId === 'prometheus') {
        newConfig.prometheus = formData;
      }

      await updateConfig(newConfig);
      setConfig(newConfig);
      setIsModalOpen(false);
      // Removed setConfigChanged(true) since backend sink manager supports live reload
    } catch (e) {
      alert('Failed to save config: ' + e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportConfig = () => {
    if (!config) {
      alert('Configuration is not loaded yet.');
      return;
    }
    try {
      const jsonString = JSON.stringify(config, null, 2);
      
      const dateString = new Date().toISOString().split('T')[0];
      const fileName = `ruuvi-gateway-config-${dateString}.json`;
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up async to ensure the browser registers the click
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Failed to export config:', error);
      alert('Failed to export config. Please try again.');
    }
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedConfig = JSON.parse(content);
        
        setIsSaving(true);
        await updateConfig(parsedConfig);
        setConfig(parsedConfig);
        setConfigChanged(true);
        setShowRestartPrompt(true); // Show restart prompt as the config changes are likely major
        
      } catch (error) {
        console.error('Failed to import config:', error);
        alert('Invalid configuration file. Please ensure it is a valid JSON config.');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleRestart = async () => {
    if (!confirm('Are you sure you want to restart the gateway?')) return;

    setIsRestarting(true);
    try {
      await restartGateway();
      // Wait a bit to allow restart to trigger
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (e) {
      alert('Failed to restart: ' + e);
      setIsRestarting(false);
    }
  };

  const saveTagSettings = async () => {
    setIsSaving(true);
    try {
      if (!selectedTag || !config) return;
      let nameChanged = false;
      const nameResult = await setTagName(selectedTag.mac, tagModalName);
      if (nameResult.success) {
        setConfig({ ...config, tag_names: nameResult.tag_names });
        nameChanged = tagModalName !== initialTagName;
      }
      const enableResult = await enableTag(selectedTag.mac, tagModalEnabled);
      if (enableResult.success) {
        setConfig(prev => prev ? { ...prev, enabled_tags: enableResult.enabled_tags } : null);
        // Enable/disable takes effect immediately - no restart needed
      }
      // Only name changes require restart (for data sink topic names etc.)
      if (nameChanged) setConfigChanged(true);
      setSelectedTag(null);
    } catch (e) {
      alert('Failed to save: ' + e);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions
  const getTagName = (mac: string) => {
    return config?.tag_names?.[mac];
  };

  const isTagEnabled = (mac: string) => {
    // If enabled_tags is empty/undefined, defaults might differ, but usually it implies none or all? 
    // Based on handleTagEnable (api.go), it adds to the list. 
    // If the list is nil in config, it might mean "allow interaction" or "none enabled".
    // Let's assume explicit allowlist if the array exists. 
    // But typical behavior (allowlisting) means if the list is present, only those are enabled.
    // If config.enabled_tags is undefined, maybe all are enabled? 
    // Let's stick effectively to: is it in the list?
    return config?.enabled_tags?.some(m => m.toLowerCase() === mac.toLowerCase()) ?? false;
  };

  const openTagModal = (tag: Tag) => {
    const name = getTagName(tag.mac) || '';
    const enabled = isTagEnabled(tag.mac);
    setSelectedTag(tag);
    setTagModalName(name);
    setTagModalEnabled(enabled);
    setInitialTagName(name);
    setInitialTagEnabled(enabled);
  };

  const handleConfigure = (id: string) => {
    setActiveSinkId(id);
    if (!config) return;

    let data: any = null;
    if (id === 'mqtt_publisher') {
      data = config.mqtt_publisher || {
        enabled: false,
        broker_url: 'tcp://localhost:1883',
        client_id: 'ruuvi-gateway',
        topic_prefix: 'ruuvi',
        send_decoded: true,
        minimum_interval: '1s'
      };
    } else if (id === 'influxdb_publisher') {
      data = config.influxdb_publisher || {
        enabled: false,
        url: 'http://localhost:8086',
        auth_token: '',
        org: 'my-org',
        bucket: 'ruuvi',
        measurement: 'ruuvi_measurements',
        minimum_interval: '1s'
      };
    } else if (id === 'influxdb3_publisher') {
      data = config.influxdb3_publisher || {
        enabled: false,
        url: 'https://us-east-1-1.aws.cloud2.influxdata.com',
        auth_token: '',
        database: 'ruuvi',
        measurement: 'ruuvi_measurements',
        minimum_interval: '1s'
      };
    } else if (id === 'prometheus') {
      // Prometheus usually just has enabled/disabled in this simple config, 
      // but let's check the schema. It has port and prefix.
      // For now, we don't have a form for it in the modal (based on lines 216-220), 
      // it just shows a message. But we set ID so the modal opens.
    }
    setFormData(data);
    setInitialFormData(JSON.parse(JSON.stringify(data))); // Deep clone for comparison
    setIsModalOpen(true);
  };

  // Calculate dirty state for config modal
  const isConfigFormDirty = formData && initialFormData
    ? JSON.stringify(formData) !== JSON.stringify(initialFormData)
    : false;

  // Calculate dirty state for tag modal
  const isTagFormDirty = tagModalName !== initialTagName || tagModalEnabled !== initialTagEnabled;

  const sinks = [
    {
      id: 'mqtt_publisher',
      title: 'MQTT Publisher',
      desc: 'Publish tag data to MQTT broker',
      icon: Cloud,
      enabled: config?.mqtt_publisher?.enabled ?? false
    },
    {
      id: 'influxdb_publisher',
      title: 'InfluxDB v2',
      desc: 'Write data to InfluxDB v2',
      icon: Database,
      enabled: config?.influxdb_publisher?.enabled ?? false
    },
    {
      id: 'influxdb3_publisher',
      title: 'InfluxDB v3',
      desc: 'Write data to InfluxDB Cloud / v3',
      icon: Database,
      enabled: config?.influxdb3_publisher?.enabled ?? false
    },
    {
      id: 'prometheus',
      title: 'Prometheus',
      desc: 'Expose metrics for scraping',
      icon: BarChart3,
      enabled: config?.prometheus?.enabled ?? false
    }
  ];

  return (
    <div className="min-h-screen bg-ruuvi-dark text-ruuvi-text transition-colors duration-250">
      {/* Header */}
      <header className="bg-ruuvi-card border-b border-ruuvi-border transition-colors duration-250">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-ruuvi-success" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-ruuvi-text">Ruuvi Gateway</h1>
              <span className="text-xs text-ruuvi-text-muted">{version}</span>
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-ruuvi-success/15 text-ruuvi-success'
                  : 'text-ruuvi-text-muted hover:text-ruuvi-text hover:bg-ruuvi-dark/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('configuration')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'configuration'
                  ? 'bg-ruuvi-success/15 text-ruuvi-success'
                  : 'text-ruuvi-text-muted hover:text-ruuvi-text hover:bg-ruuvi-dark/50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Configuration
            </button>
          </nav>

          <div className="flex items-center gap-3 min-w-[180px] justify-end">
            {configChanged && (
              <button
                onClick={() => setShowRestartPrompt(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-ruuvi-dark bg-ruuvi-accent hover:bg-ruuvi-accent/90 rounded-lg transition-all animate-pulse shadow-glow"
              >
                <RefreshCw className="w-4 h-4" />
                Restart to Apply
              </button>
            )}
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 rounded-lg transition-colors bg-ruuvi-toggle-bg hover:bg-ruuvi-text-muted/10 text-ruuvi-text-muted hover:text-ruuvi-text"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* === Dashboard Tab === */}
        {activeTab === 'dashboard' && (
          <section>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-ruuvi-text">Discovered Tags</h2>
              <p className="text-ruuvi-text-muted mt-1">Nearby RuuviTags detected by the scanner</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {tags
                .sort((a, b) => a.mac.localeCompare(b.mac))
                .map((tag) => (
                  <IntegrationCard
                    key={tag.mac}
                    title={getTagName(tag.mac) || `RuuviTag ${tag.mac.slice(-5)}`}
                    subtitle={tag.mac}
                    description=""
                    icon={Bluetooth}
                    dataFormat={tag.data_format}
                    sensors={{
                      temperature: tag.temperature,
                      humidity: tag.humidity,
                      pressure: tag.pressure,
                      voltage: tag.battery_voltage,
                      rssi: tag.rssi,
                      pm2p5: tag.pm2p5,
                      co2: tag.co2,
                      voc: tag.voc,
                      nox: tag.nox,
                      illuminance: tag.illuminance,
                      sound_average: tag.sound_average,
                      movement_counter: tag.movement_counter,
                      air_quality_index: tag.air_quality_index
                    }}
                    onConfigure={() => openTagModal(tag)}
                    lastSeen={tag.last_seen}
                    isEnabled={isTagEnabled(tag.mac)}
                    onToggleEnabled={async (enabled) => {
                      try {
                        const result = await enableTag(tag.mac, enabled);
                        if (result.success) {
                          setConfig(prev => prev ? { ...prev, enabled_tags: result.enabled_tags } : null);
                        }
                      } catch (e) {
                        console.error('Failed to toggle tag:', e);
                      }
                    }}
                  />
                ))}
              {tags.length === 0 && (
                <div className="col-span-full py-12 text-center text-ruuvi-text-muted bg-ruuvi-card/50 rounded-xl border border-dashed border-ruuvi-text-muted/20">
                  No tags discovered yet.
                </div>
              )}
            </div>
          </section>
        )}

        {/* === Configuration Tab === */}
        {activeTab === 'configuration' && (
          <section>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-ruuvi-text">Data Sinks</h2>
              <p className="text-ruuvi-text-muted mt-1">Configure where tag data is forwarded</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {sinks.map((sink) => (
                <IntegrationCard
                  key={sink.id}
                  title={sink.title}
                  description={sink.desc}
                  icon={sink.icon}
                  status={sink.enabled ? 'active' : 'inactive'}
                  onConfigure={() => handleConfigure(sink.id)}
                />
              ))}
            </div>

            {/* Backup & Restore Section */}
            <div className="mt-12 pt-8 border-t border-ruuvi-border">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-ruuvi-text">Backup & Restore</h3>
                <p className="text-sm text-ruuvi-text-muted mt-1">Import or export your gateway configuration</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleExportConfig}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors bg-ruuvi-card border border-ruuvi-border hover:border-ruuvi-text-muted/30 text-ruuvi-text hover:bg-ruuvi-card/80 shadow-sm"
                >
                  <Download className="w-5 h-5 text-ruuvi-success" />
                  Export Configuration
                </button>
                
                <label className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors bg-ruuvi-card border border-ruuvi-border hover:border-ruuvi-text-muted/30 text-ruuvi-text hover:bg-ruuvi-card/80 shadow-sm cursor-pointer disabled:opacity-50">
                  <Upload className="w-5 h-5 text-ruuvi-accent" />
                  Import Configuration
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportConfig}
                    disabled={isSaving}
                  />
                </label>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Config Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          activeSinkId === 'mqtt_publisher' ? 'Configure MQTT Publisher' :
            activeSinkId === 'influxdb_publisher' ? 'Configure InfluxDB Publisher' :
              activeSinkId === 'influxdb3_publisher' ? 'Configure InfluxDB v3 Publisher' :
                'Configure Integration'
        }
        onSubmit={handleSave}
        isSaving={isSaving}
        isFormDirty={isConfigFormDirty}
      >
        {activeSinkId === 'mqtt_publisher' && (
          <MQTTForm
            initialConfig={formData}
            onChange={setFormData}
          />
        )}
        {activeSinkId === 'influxdb_publisher' && (
          <InfluxDBForm
            initialConfig={formData}
            onChange={setFormData}
          />
        )}
        {activeSinkId === 'influxdb3_publisher' && (
          <InfluxDB3Form
            initialConfig={formData}
            onChange={setFormData}
          />
        )}
      </Modal>

      {/* Restart Confirmation Dialog */}
      {showRestartPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-ruuvi-card border border-ruuvi-text-muted/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-ruuvi-text mb-2">Restart Required</h3>
            <p className="text-ruuvi-text-muted mb-6">
              Configuration changes have been saved. The gateway needs to restart for changes to take effect.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRestartPrompt(false)}
                className="px-4 py-2 text-sm font-medium text-ruuvi-text-muted hover:text-white hover:bg-ruuvi-dark/50 rounded-lg transition-colors border border-transparent hover:border-ruuvi-text-muted/30"
                disabled={isRestarting}
              >
                Later
              </button>
              <button
                onClick={handleRestart}
                disabled={isRestarting}
                className="px-4 py-2 text-sm font-bold text-ruuvi-dark bg-ruuvi-success hover:bg-ruuvi-success/90 rounded-lg transition-colors disabled:opacity-50"
              >
                {isRestarting ? 'Restarting...' : 'Restart Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Editing Modal */}
      <Modal
        isOpen={!!selectedTag}
        onClose={() => setSelectedTag(null)}
        title={getTagName(selectedTag?.mac || '') || `RuuviTag ${selectedTag?.mac?.slice(-5) || ''}`}
        onSubmit={saveTagSettings}
        isSaving={isSaving}
        isFormDirty={isTagFormDirty}
      >
        {selectedTag && (
          <RuuviTagForm
            tag={selectedTag}
            tagName={tagModalName}
            enabled={tagModalEnabled}
            onNameChange={setTagModalName}
            onEnabledChange={setTagModalEnabled}
          />
        )}
      </Modal>
    </div>
  );
}
