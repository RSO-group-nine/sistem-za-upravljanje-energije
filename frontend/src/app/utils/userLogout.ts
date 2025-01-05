import { baseURL } from "./baseUrl";

export default async function userLogout() {
    const response = await fetch(`${baseURL}/users/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    const data = await response.json();
    return data;
}
