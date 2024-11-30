"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Define validation schema using Yup
const RegistrationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
    .test(
      "no-scripts",
      "Prompt contains invalid characters or scripts",
      (value) => !/<|>|script|javascript:/i.test(value || "")
    ),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
    .test(
      "no-scripts",
      "Prompt contains invalid characters or scripts",
      (value) => !/<|>|script|javascript:/i.test(value || "")
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Confirm password is required")
    .test(
      "no-scripts",
      "Prompt contains invalid characters or scripts",
      (value) => !/<|>|script|javascript:/i.test(value || "")
    ),
});

export default function RegistrationForm() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegistration = async (values: {
    email: string;
    password: string;
  }): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed.");
      }
      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <main>
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">
        Registration
      </h2>
      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "" }}
        validationSchema={RegistrationSchema}
        onSubmit={(values) => {
          handleRegistration(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6 text-gray-700">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Email
              </label>
              <Field
                type="email"
                name="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your email"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text- pt-1"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Set password
              </label>
              <Field
                type="password"
                name="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your password"
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-sm pt-1"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Confirm password
              </label>
              <Field
                type="password"
                name="confirmPassword"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Confirm your password"
              />
              <ErrorMessage
                name="confirmPassword"
                component="p"
                className="text-red-500 text-sm pt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
            {successMessage && (
              <p className="text-green-500 text-center mt-4">
                {successMessage}
              </p>
            )}
          </Form>
        )}
      </Formik>
    </main>
  );
}
