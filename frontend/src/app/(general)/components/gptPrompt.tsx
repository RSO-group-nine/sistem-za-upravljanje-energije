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

interface ConsumptionGraphProps {
  data: {
    systemProperties: {
      "iothub-enqueuedtime": string;
      "iothub-connection-device-id": string;
    };
    body: {
      date: string;
      temperature: number;
    };
    ID: string;
  }[];
}

export default function GptPrompt({ data }: ConsumptionGraphProps) {
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const [isCheckboxSelected, setIsCheckboxSelected] = useState(true);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckboxSelected(event.target.checked);
  };

  const formatConsumptionData = (
    data: ConsumptionGraphProps["data"]
  ): string => {
    return data
      .map((item) => {
        const date = item.systemProperties["iothub-enqueuedtime"];
        const temperature = item.body.temperature;
        const device = item.systemProperties["iothub-connection-device-id"];
        return `${device} : ${date} : ${temperature} °C`;
      })
      .join(", ");
  };

  const handlePrompt = async (values: { prompt: string }): Promise<void> => {
    try {
      setError("");

      let promptInput = "";
      if (data && isCheckboxSelected) {
        promptInput =
          values.prompt +
          "\n" +
          "Question is based for next temperature data in format [device : date : temperature °C, ...]: " +
          formatConsumptionData(data);
      } else {
        promptInput = values.prompt;
      }

      console.log("Prompt input:", promptInput);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/gpt/prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: promptInput }),
        }
      );

      if (!res.ok) {
        const message = `An error has occurred: ${res.status}`;
        console.error(message);
        setError(message);
        return;
      }

      const reponse = await res.json();
      setResponse(reponse);
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main>
      <h2 className="text-2xl font-bold mb-6 text-blue-500">
        Ask GPT about your tempetaure consumption tips
      </h2>
      <Formik
        initialValues={{ prompt: "" }}
        validationSchema={PromptSchema}
        onSubmit={handlePrompt}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4 text-gray-700">
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
            <div className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                name="includeTemperature"
                id="includeTemperature"
                value="checkedValue"
                defaultChecked={isCheckboxSelected}
                onChange={handleCheckboxChange}
              />
              <label
                htmlFor="includeTemperature"
                className="ml-2 text-gray-700"
              >
                Include temperature data in GPT prompt
              </label>
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
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-64"
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
