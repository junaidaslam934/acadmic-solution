import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo / Icon Area */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">🎓</span>
          </div>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Academic Solutions
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
          Your all-in-one platform for managing courses, attendance, and academic records.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            Get Started →
          </Link>
          <Link
            href="/login?tab=student"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
}