'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type UserRole = 'student' | 'teacher' | 'admin';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const tabs = [
    { id: 'student' as UserRole, label: 'Student', icon: '🎓' },
    { id: 'teacher' as UserRole, label: 'Teacher', icon: '👨‍🏫' },
    { id: 'admin' as UserRole, label: 'Admin', icon: '⚙️' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        role: activeTab,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        // Get the session to check user data
        const session = await getSession();
        
        // Redirect based on role
        switch (session?.user?.role) {
          case 'teacher':
            router.push('/teacher/dashboard');
            break;
          case 'student':
            router.push('/student/dashboard');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'student':
        return 'student@ned.edu.pk';
      case 'teacher':
        return 'teacher@ned.edu.pk';
      case 'admin':
        return 'admin@ned.edu.pk';
      default:
        return 'email@ned.edu.pk';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Top banner */}
        <div className="bg-red-800 text-white text-center py-3 px-6 rounded-t-2xl">
          <h1 className="text-xl font-bold tracking-wide">CIS Academic Portal</h1>
          <p className="text-red-200 text-xs mt-0.5">
            Department of Computer &amp; Information Systems Engineering
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[70px] py-3 px-2 text-xs font-medium flex flex-col items-center gap-0.5 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-red-700 border-b-2 border-red-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Role Indicator */}
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Signing in as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  📧 Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={getPlaceholder()}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors duration-200"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  🔒 Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors duration-200"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  `Sign in as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                )}
              </button>

              {/* Demo Credentials */}
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Demo Credentials:</p>
                  <div className="space-y-1">
                    <p><strong>Student:</strong> student@ned.edu.pk / password</p>
                    <p><strong>Teacher:</strong> teacher@ned.edu.pk / password</p>
                    <p><strong>Admin:</strong> admin@ned.edu.pk / password</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-slate-400">
            For registration issues, contact{' '}
            <a href="#" className="text-red-400 hover:text-red-300">
              admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}