import ConsumptionGraph from "./consumptionGraph";
import GptPrompt from "./gptPrompt";
import { useEffect, useState } from "react";
import getDeviceReadings from "@/app/utils/getDeviceReadings";
import Device from "@/app/entities/device";

interface DeviceComponentProps {
    device: Device;
}

export default function deviceComponent({ device }: DeviceComponentProps) {
    const [deviceData, setDeviceData] = useState<any>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDeviceReadings(device);
                setDeviceData(data);
            } catch (error) {
                console.error('Error fetching device data:', error);
            }
        };

        fetchData();
    }, [device.az_connection_string]);

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
            <GptPrompt />
        </div>
    );
}