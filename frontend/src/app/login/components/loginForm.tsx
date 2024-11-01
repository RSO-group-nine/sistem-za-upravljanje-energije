"use client";
import { useState } from "react";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        // Handle login logic here
        console.log('Logging in with:', { email, password });
    };
    return (
        <main>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">Login</h2>
                <form onSubmit={handleLogin} className="space-y-6 text-gray-700">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your email"
                    required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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