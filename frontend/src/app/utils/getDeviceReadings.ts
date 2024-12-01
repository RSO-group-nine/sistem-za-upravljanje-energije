import Device from "../entities/device";

export interface Props {
    device: Device;
}

export default async function getDeviceReadings(device: Device) {
    const az_device_id = device.az_device_id;
    const id = device.device_id;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/devices/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); 
        data.sort((a, b) => new Date(a.systemProperties["iothub-enqueuedtime"]).getTime() - new Date(b.systemProperties["iothub-enqueuedtime"]).getTime());

        console.log(`Device readings for device ${az_device_id}`, data);
        return data;
    } catch (error) {
        console.error('Failed to fetch device readings:', error);
        throw error;
    }
}
