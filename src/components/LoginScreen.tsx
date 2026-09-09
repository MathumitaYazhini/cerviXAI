import React, { useState } from 'react';
import { Microscope, Lock, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (doctorName: string, role: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('dr.ananya.sharma@aiims.edu.in');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      // Extract a realistic doctor display name from email or use default
      let displayName = 'Dr. Ananya Sharma, MD';
      if (username && username.includes('@')) {
        const localPart = username.split('@')[0].replace(/[._]/g, ' ');
        displayName = localPart
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        if (!displayName.toLowerCase().startsWith('dr')) {
          displayName = `Dr. ${displayName}`;
        }
      }
      onLogin(displayName, 'Cytopathologist');
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#B85C38] text-white shadow-xs mb-3">
            <Microscope className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2F3A3D]">
            CerviXAI
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[#5B6B6F] font-normal">
            From cellular patterns to clearer decisions.
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username-input" className="block text-xs font-medium text-[#2F3A3D] mb-1.5">
                Username / Institutional Email
              </label>
              <input
                type="text"
                id="login-username-input"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dr.ananya.sharma@aiims.edu.in"
                className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3.5 py-2.5 text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none focus:ring-1 focus:ring-[#B85C38]"
              />
            </div>

            <div>
              <label htmlFor="login-password-input" className="block text-xs font-medium text-[#2F3A3D] mb-1.5">
                Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4 h-4 text-[#5B6B6F]" />
                </div>
                <input
                  type="password"
                  id="login-password-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full rounded-md border border-[#DCD4C7] bg-white pl-9 pr-3.5 py-2.5 text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none focus:ring-1 focus:ring-[#B85C38]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md text-sm font-semibold text-white bg-[#B85C38] hover:bg-[#964726] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B85C38] transition-colors shadow-xs disabled:opacity-75"
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                    Accessing Workspace...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    Login / Access Workspace
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
