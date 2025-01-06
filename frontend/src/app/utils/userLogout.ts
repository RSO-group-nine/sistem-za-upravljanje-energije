import { baseURL } from "./baseUrl";
import { useCookies } from "react-cookie";

export default async function userLogout(token: string) {
    const response = await fetch(`${baseURL}/users/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
    });
    const data = await response.json();
    return data;
}
