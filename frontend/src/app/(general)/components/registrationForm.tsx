"use client";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegistrationForm() {
    const router = useRouter();

    const handleRegistration = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            window.alert('Passwords do not match');
            return;
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
                window.alert("Registration successful");
                console.log("entity:", data);
                
                router.push("/dashboard");

            } catch (e) {
            console.error("An error has occured:", e);

        }          
    };
    
    return (
        <main>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">Registration</h2>
                <form onSubmit={handleRegistration} className="space-y-6 text-gray-700">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
                    <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your email"
                    required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Set password</label>
                    <input
                    type="password"
                    name="password"
                    min={6}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your password"
                    required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Confirm password</label>
                    <input
                    type="password"
                    name="confirmPassword"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Confirm your password"
                    required
                    />  
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Register
                </button>
            </form>
        </main>
    );
}