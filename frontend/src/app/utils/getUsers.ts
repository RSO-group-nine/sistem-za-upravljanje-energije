export default async function getUser() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}
