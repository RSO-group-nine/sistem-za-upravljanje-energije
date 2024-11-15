import ConsumptionGraph from "./consumptionGraph";
import GptPrompt from "./gptPrompt";
import { useState } from "react";
import getDeviceReadings from "@/app/utils/getDeviceReadings";
import Device from "@/app/entities/device";

interface DeviceComponentProps {
    device: Device;
}

export default function deviceComponent({ device }: DeviceComponentProps) {
    const [deviceData, setDeviceData] = useState<any>([]);

    async function fetchTheData() {
        try {
            const data = await getDeviceReadings(device);
            setDeviceData(data);
        } catch (error) {
            console.error('Error fetching device data:', error);
        }
    };


    function getDeviceIdFromCS(az_connection_string: string) {
        const segments = az_connection_string.split(";");
        const deviceIdSegment = segments.find(segment => segment.startsWith("DeviceId="));
        const deviceId = deviceIdSegment?.split("=")[1];
        return deviceId;
    }

    return (
        <div className="container flex flex-col gap-4">
            <h1 className="text-blue-500">{getDeviceIdFromCS(device.az_connection_string)}</h1>
            <ConsumptionGraph data={deviceData} />
            <button onClick={fetchTheData} className="bg-blue-500 text-white p-4 w-1/3 flex items-center justify-center rounded-md hover:bg-blue-600 transition-colors duration-200 ease-in-out">
                Fetch readings for this device
            </button>
            <GptPrompt />
        </div>
    );
}