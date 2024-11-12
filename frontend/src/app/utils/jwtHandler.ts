export default async function verifyUser(token: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/users/resolve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            console.log(response);
            return null;

        }
        const data = await response.json();
        console.log("entity:", data);
        return data.id;
    } catch (e) {
        console.error("An error has occured:", e);

    }
}        