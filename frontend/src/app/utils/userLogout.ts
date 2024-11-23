export default async function userLogout() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/users/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    const data = await response.json();
    return data;
}
