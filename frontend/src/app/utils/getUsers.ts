import { baseURL } from "./baseUrl";

export default async function getUser() {
    const response = await fetch(`${baseURL}/users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}
