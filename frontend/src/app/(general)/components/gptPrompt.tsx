"use client";
import { useState } from "react";

export default function GptPrompt() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePrompt = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (prompt === "") {
      setError("Prompt cannot be empty");
      window.alert(error);
      return;
    }
    setError("");
    setIsLoading(true);
    // const bod = JSON.stringify({ prompt });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/gpt/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    setIsLoading(false);
    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      console.error(message);
      setError(message);
      return;
    } else {
      const data = await res.json();
      setResponse(data);
    }
  };

  return (
    <main>
      <h2 className="text-2xl font-bold mb-6 text-blue-500">GPT Prompt</h2>
      <form onSubmit={handlePrompt} className="space-y-6 text-gray-700">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-600">
            Prompt
          </label>
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
          className={`py-2 px-4 rounded-lg ${
            isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
          } text-white`}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-600">
            Response
          </label>
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
