import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      {/*
        To use the CIS building photo, set this div's style to:
        backgroundImage: "url('/images/cis-building.jpg')"
        and ensure the file is placed at public/images/cis-building.jpg
      */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 overflow-hidden">
        {/* Decorative overlay pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(185,28,28,0.4),transparent_70%)]" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-red-400 text-sm font-semibold tracking-widest uppercase mb-4">
            NED University of Engineering &amp; Technology
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-2 leading-tight">
            WELCOME TO
          </h1>
          <h2 className="text-4xl sm:text-6xl font-extrabold text-red-400 mb-6 leading-tight">
            CIS Academic Portal
          </h2>
          <p className="text-lg text-slate-300 mb-2 font-medium">
            Department of Computer &amp; Information Systems Engineering
          </p>
          <p className="text-base text-slate-400 mb-10 max-w-2xl mx-auto">
            We lead in computing and innovation for smart, secure and sustainable future.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors duration-200 shadow-lg text-lg"
          >
            Sign In to Portal →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-10">
            Academic Management Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Course Management',
                description: 'Manage course registrations, assignments, and syllabi for all years and semesters.',
              },
              {
                icon: '✅',
                title: 'Attendance Tracking',
                description: 'Mark and monitor student attendance with detailed reports and analytics.',
              },
              {
                icon: '📅',
                title: 'Timetable Generation',
                description: 'Automatically generate and manage class timetables based on credit hours.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Access Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-10">
            Portal Access
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: '🎓', label: 'Student', href: '/login?tab=student' },
              { icon: '👨‍🏫', label: 'Teacher', href: '/login?tab=staff' },
              { icon: '📋', label: 'Advisor', href: '/login?tab=class-advisor' },
              { icon: '🔗', label: 'Coordinator', href: '/login?tab=coordinator' },
              { icon: '⚙️', label: 'Admin', href: '/login?tab=admin' },
            ].map((role) => (
              <Link
                key={role.label}
                href={role.href}
                className="flex flex-col items-center p-5 bg-white rounded-xl border border-gray-200 hover:border-red-600 hover:shadow-md transition-all group"
              >
                <span className="text-3xl mb-2">{role.icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-700 transition-colors">
                  {role.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center">
        <p className="text-sm mb-1">
          © 2024 CIS Department, NED University of Engineering &amp; Technology
        </p>
        <p className="text-xs text-slate-500">Powered by CIS Academic Solutions</p>
      </footer>
    </div>
  );
}