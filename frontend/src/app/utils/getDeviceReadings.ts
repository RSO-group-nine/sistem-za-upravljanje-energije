import Device from "../entities/device";

export interface Props {
    device: Device;
}

export default async function getDeviceReadings(device: Device) {
    const az_connection_string = device.az_connection_string;
    const id = device.device_id;
    console.log('Device id:', id);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/devices/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });
        console.log('response:', response);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Device readings:', data);
        return data;
    } catch (error) {
        console.error('Failed to fetch device readings:', error);
        throw error;
    }
}
