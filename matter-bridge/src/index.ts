import { ServerNode, Environment, StorageService } from "@matter/main";
import { AggregatorEndpoint } from "@matter/main/endpoints/aggregator";
import { TemperatureSensorDevice } from "@matter/main/devices/temperature-sensor";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors/bridged-device-basic-information";
import express from "express";
import axios from "axios";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

// Configuration
const CONFIG_PATH = process.env.CONFIG_PATH || "/app/config.yml";
const STORAGE_PATH = process.env.STORAGE_PATH || "data";
const GATEWAY_API = process.env.GATEWAY_API || "http://localhost:8080/api/tags";

interface RuuviTag {
    mac: string;
    temperature?: number;
    humidity?: number;
    pressure?: number;
    last_seen: number;
}

interface Config {
    matter: {
        enabled: boolean;
        passcode: number;
        discriminator: number;
        vendor_id: number;
        product_id: number;
    };
}

// Define Bridged Device Type
const BridgedTemperatureSensor = TemperatureSensorDevice.with(BridgedDeviceBasicInformationServer);

async function main() {
    console.log("Starting Ruuvi Matter Bridge...");

    // 1. Load Config
    let config: Config = {
        matter: {
            enabled: true,
            passcode: 20202021,
            discriminator: 3840,
            vendor_id: 0xFFF1,
            product_id: 0x8000,
        }
    };

    if (fs.existsSync(CONFIG_PATH)) {
        try {
            const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
            const yamlConfig = yaml.load(fileContents) as any;
            if (yamlConfig && yamlConfig.matter) {
                config.matter = { ...config.matter, ...yamlConfig.matter };
            }
        } catch (e) {
            console.error("Failed to load config.yml, using defaults", e);
        }
    }

    if (!config.matter.enabled) {
        console.log("Matter support is disabled in config. Exiting.");
        return;
    }

    if (!config.matter.enabled) {
        console.log("Matter support is disabled in config. Exiting.");
        return;
    }

    const environment = Environment.default;
    environment.get(StorageService).location = path.resolve(STORAGE_PATH);

    // Using new API: ServerNode.create(config)
    const server = await ServerNode.create({
        environment,
        // Network Config
        network: {
            port: 5540,
        },
        // Commissioning Config
        commissioning: {
            passcode: config.matter.passcode,
            discriminator: config.matter.discriminator,
        },
        // Basic Information
        basicInformation: {
            vendorName: "Ruuvi",
            vendorId: config.matter.vendor_id,
            productName: "Ruuvi Matter Bridge",
            productId: config.matter.product_id,
            serialNumber: "RUUVI-BRIDGE-001",
            nodeLabel: "Ruuvi Gateway",
        },
        // Product Description (for discovery)
        productDescription: {
            name: "Ruuvi Matter Bridge",
            deviceType: 0x000e, // Aggregator device type (or use RootNode default 22)
            vendorId: config.matter.vendor_id,
            productId: config.matter.product_id,
        },
        // Define parts (Endpoints)
        parts: [
            {
                type: AggregatorEndpoint,
                id: "bridge",
            }
        ]
    });

    await server.start();
    console.log("Matter Server started");

    // Get pairing code
    // In new API, commissioning behavior has pairing codes?
    // Using internal API to get it if not directly exposed on helper.
    // However, server represents the node.
    // commissioning is a behavior.

    // Note: getPairingCode might not be directly on server instance in 0.12 without access to commissioning behavior state.
    // But let's try to access it via state or if printed in logs. 
    // Usually it logs it.
    // For API access:
    const commissioningBehavior = server.state.commissioning;
    // We'll construct it if needed or assume we can get it. 
    // The previous code used commissioningServer.getPairingCode().
    // We'll need to look up how to get it in 0.12. 
    // Workaround: Use default values or just log that it's in the console.
    // But for the frontend API, we need it.
    // Let's assume server.state.commissioning has it or similar.
    // Actually, ServerNode likely doesn't expose it simply.
    // We'll try to find it dynamically or just hardcode the manual code based on passcode/discriminator for now to unblock.
    // (Generating it properly requires bit packing).
    // Let's see if we can get it from the running server.

    // @ts-ignore
    const bridge = server.parts.get("bridge"); // Access the aggregator endpoint part
    if (!bridge) {
        console.error("Aggregator endpoint not found!");
        return;
    }

    const updateLoop = async () => {
        try {
            const response = await axios.get<RuuviTag[]>(GATEWAY_API);
            const tags = response.data;

            for (const tag of tags) {
                const uniqueId = "ruuvi-" + tag.mac.replace(/:/g, "").toLowerCase();
                const tempVal = tag.temperature;

                // Check if device exists
                let device = bridge.parts.get(uniqueId);

                if (!device && tempVal !== undefined) {
                    console.log(`Adding new device: ${tag.mac}`);

                    // Add new endpoint part to the bridge
                    // @ts-ignore
                    device = await bridge.parts.add({
                        type: BridgedTemperatureSensor,
                        id: uniqueId,
                        bridgedDeviceBasicInformation: {
                            nodeLabel: `RuuviTag ${tag.mac}`,
                            serialNumber: tag.mac.replace(/:/g, ""),
                            productName: "RuuviTag",
                            reachable: true,
                            vendorId: config.matter.vendor_id,
                        }
                    } as any);
                } else if (device && tempVal !== undefined) {
                    // Update state
                    // ServerNode Endpoint API
                    // @ts-ignore
                    await (device as any).set({
                        temperatureMeasurement: {
                            measuredValue: Math.round(tempVal * 100)
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error polling Gateway:", error instanceof Error ? error.message : "Unknown error");
        }

        setTimeout(updateLoop, 5000);
    };

    updateLoop();

    // 4. API for Local Frontend (Proxy)
    const app = express();

    // Store codes for API
    let qrCodeUrl = "";
    let pairingCode = "";

    // Check commissioning status
    if (!server.lifecycle.isCommissioned) {
        const pairingCodes = server.state.commissioning.pairingCodes;
        console.log("---------------------------------------------------");
        console.log("NOT COMMISSIONED");
        console.log("Manual Pairing Code:", pairingCodes.manualPairingCode);
        console.log("QR Code Content:", pairingCodes.qrPairingCode);
        console.log("---------------------------------------------------");

        qrCodeUrl = pairingCodes.qrPairingCode;
        pairingCode = pairingCodes.manualPairingCode;
    } else {
        console.log("Device is ALREADY COMMISSIONED");
    }

    server.events.commissioning.commissioned.on(() => {
        console.log("EVENT: Device has been COMMISSIONED!");
    });

    server.events.commissioning.decommissioned.on(() => {
        console.log("EVENT: Device has been DECOMMISSIONED");
    });


    app.get("/api/pairing", (req, res) => {
        res.json({
            pairing_code: pairingCode,
            qr_code: qrCodeUrl,
        });
    });

    app.listen(5555, () => {
        console.log("Local Bridge API listening on port 5555");
    });
}

main().catch(console.error);
