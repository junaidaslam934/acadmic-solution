import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Academic Solutions
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your comprehensive academic management platform
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}