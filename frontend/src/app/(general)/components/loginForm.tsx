'use client'
import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
    const router = useRouter();

    const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/users/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                window.alert("Login failed");
                return;
            }else {
                const data = await response.json();
                const user = data.user;
                const email = user.email;
                sessionStorage.setItem("email", email);
                sessionStorage.setItem("id", user.id);
                window.alert("Login successful");
                router.push("/dashboard");
            }
        } catch (e) {
            console.error("An error has occured:", e);

        }          
    };
    return (
        <main>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">Login</h2>
                <form onSubmit={handleLogin} className="space-y-6 text-gray-700">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
                    <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your email"
                    required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
                    <input
                    type="password"
                    name="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your password"
                    required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Login
                </button>
            </form>
        </main>
    );
}