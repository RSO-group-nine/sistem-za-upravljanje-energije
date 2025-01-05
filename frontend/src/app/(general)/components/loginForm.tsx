"use client";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useCookies } from "react-cookie";

const LoginFormSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
    .test(
      "no-scripts",
      "Prompt contains invalid characters or scripts",
      (value) => !/<|>|script|javascript:/i.test(value || "")
    ),
  password: Yup.string()
    .required("Password is required")
    .test(
      "no-scripts",
      "Prompt contains invalid characters or scripts",
      (value) => !/<|>|script|javascript:/i.test(value || "")
    ),
});

export default function LoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [,setCookie, ] = useCookies(['token']);

  const handleLogin = async (values: {
    email: string;
    password: string;
  }): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/users/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) {
        setLogin(false);
        setRedirect(false);
        return;
      } else {
        const data = await response.json();
        setCookie("token", data.token, { path: "/" });
        sessionStorage.setItem("email", data.user.email);
        sessionStorage.setItem("id", data.user.id);
        setLogin(true);
        setRedirect(true);
        router.push("/dashboard");
      }
    } catch (e) {
      setLogin(false);
      setRedirect(false);
      console.error("An error has occured:", e);
    }
  };

  return (
    <main>
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">
        Login
      </h2>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginFormSchema}
        onSubmit={(values) => handleLogin(values)}
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
                className="text-red-500 text-sm pt-1"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Password
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
            {!login && (
              <p className="text-red-500 text-md">
                Login failed. Please check your credentials.
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            {redirect && (
              <p className="text-green-500 text-md">
                Login successful. Redirecting to dashboard...
              </p>
            )}
          </Form>
        )}
      </Formik>
    </main>
  );
}
