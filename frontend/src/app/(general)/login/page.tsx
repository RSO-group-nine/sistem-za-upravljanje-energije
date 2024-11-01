"use client";
import { useState } from 'react';
import LoginForm from './components/loginForm';
import RegistrationForm from './components/registrationForm';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {isRegistering ? <RegistrationForm /> : <LoginForm />}
        <div className="mt-4 text-center">
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 hover:underline"
            >
                {isRegistering ? 'Login' : 'Register'}
            </button>
        </div>
      </div>
    </div>
  );
}
