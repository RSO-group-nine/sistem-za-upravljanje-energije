import { baseURL } from "./baseUrl";

export default async function verifyUser(token: string) {
    try {
        const response = await fetch(`${baseURL}/users/resolve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            return null;

        }
        const user = await response.json();
        
        return user;
    } catch (e) {
        console.error("An error has occured:", e);

    }
}        