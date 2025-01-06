import { baseURL } from "./baseUrl";


export default async function getUserDevices(string_user_id: string) {
    const user_id = parseInt(string_user_id);

    try {
        const response = await fetch(`${baseURL}/devices/getUserDevices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response to getUserDevices :', data);
        // console.log('Response to getUserDevices :', data.rows);
        return data;
    } catch (error) {
        console.error('Failed to fetch devices:', error);
        throw error;
    }
}
