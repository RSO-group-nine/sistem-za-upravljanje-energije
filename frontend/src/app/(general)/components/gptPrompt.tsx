"use client";
import { useState } from "react";

export default function GptPrompt() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const handlePrompt = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (prompt === '') {
            setError("Prompt cannot be empty");
            console.log(error);
            window.alert(error);
            return;
        }
        setError('');
        const bod = JSON.stringify({ prompt });
        console.log('Body:', bod);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/gpt/prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });
        if (!res.ok) {
            const message = `An error has occured: ${res.status}`;
            console.error(message);
            setError(message);
            return;
        }else{
            const data = await res.json();
            console.log("data:", data);
            setResponse(data);
        }
    };
    
    return (
        <main>
            <h2 className="text-2xl font-bold mb-6 text-blue-500">GPT Prompt</h2>
                <form onSubmit={handlePrompt} className="space-y-6 text-gray-700">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Prompt</label>
                    <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your prompt"
                    required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                    Submit
                </button>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600">Response</label>
                    <textarea
                    value={response} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Response"
                    readOnly
                    />
                </div>
            </form>
        </main>
    );
}