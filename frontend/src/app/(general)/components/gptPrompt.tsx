"use client";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Define validation schema using Yup
const PromptSchema = Yup.object().shape({
  prompt: Yup.string()
    .trim()
    .required("Prompt cannot be empty")
    .test(
      "no-scripts",
      "Prompt contains invalid characters or scripts",
      (value) => !/<|>|script|javascript:/i.test(value || "")
    ),
});

export default function GptPrompt() {
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const handlePrompt = async (values: { prompt: string }): Promise<void> => {
    try {
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/gpt/prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: values.prompt }),
        }
      );

      if (!res.ok) {
        const message = `An error has occurred: ${res.status}`;
        console.error(message);
        setError(message);
        return;
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main>
      <h2 className="text-2xl font-bold mb-6 text-blue-500">GPT Prompt</h2>
      <Formik
        initialValues={{ prompt: "" }}
        validationSchema={PromptSchema}
        onSubmit={handlePrompt}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6 text-gray-700">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Prompt
              </label>
              <Field
                name="prompt"
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your prompt"
              />
              <ErrorMessage
                name="prompt"
                component="p"
                className="text-red-500 text-sm pt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-2 px-4 rounded-lg ${
                isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
              } text-white`}
            >
              {isSubmitting ? "Generating response..." : "Submit"}
            </button>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Response
              </label>
              <textarea
                value={response}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-32"
                placeholder="Response"
                readOnly
              />
            </div>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </Form>
        )}
      </Formik>
    </main>
  );
}
