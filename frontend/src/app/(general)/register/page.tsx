import RegistrationForm from '../components/registrationForm';
import Link from 'next/link';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <RegistrationForm />
        <div className="mt-4 text-center">
            <Link
                href='/login'
                className="text-blue-600 hover:underline"
            >
                Login
            </Link>
        </div>
      </div>
    </div>
  );
}
