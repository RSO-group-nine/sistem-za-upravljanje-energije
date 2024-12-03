import LoginForm from "../components/loginForm";
import Link from "next/link";

export default function Login() {
  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url('../../../../img/background.jpg')`,
        }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Energy Management System
          </h1>
          <LoginForm />
          <div className="mt-4 text-center">
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
