export default async function getUserDevices(user_id: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/devices?userId=${user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Devices:', data.rows);
        return data.rows;
    } catch (error) {
        console.error('Failed to fetch devices:', error);
        throw error;
    }
}
