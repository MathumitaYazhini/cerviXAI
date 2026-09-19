import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X
} from 'lucide-react';
import { DoctorUser } from '../types';
import { 
  authenticateDoctor, 
  registerNewDoctor 
} from '../utils/authStorage';

interface LoginScreenProps {
  onLoginSuccess: (doctor: DoctorUser, rememberMe: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regRegNumber, setRegRegNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regHospital, setRegHospital] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('MD Cytopathology');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your Doctor Institutional Email or Registration Number.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your account password.');
      return;
    }

    setLoginLoading(true);

    setTimeout(() => {
      const result = authenticateDoctor(loginIdentifier, loginPassword);
      if (result.success && result.doctor) {
        onLoginSuccess(result.doctor, rememberMe);
      } else {
        setLoginError(result.error || 'Authentication failed. Please verify your credentials.');
        setLoginLoading(false);
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    if (!regFullName.trim() || !regRegNumber.trim() || !regEmail.trim() || !regHospital.trim()) {
      setRegError('Please complete all required doctor identification fields.');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setRegError('Please enter a valid institutional or personal email address.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters in length.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    setRegLoading(true);

    setTimeout(() => {
      const result = registerNewDoctor({
        name: regFullName,
        email: regEmail,
        password: regPassword,
        regNumber: regRegNumber,
        phone: regPhone,
        hospital: regHospital,
        specialization: regSpecialization,
      });

      setRegLoading(false);

      if (result.success && result.doctor) {
        setRegSuccessMessage('Account registered successfully! Redirecting to your clinical workspace...');
        setTimeout(() => {
          onLoginSuccess(result.doctor!, true);
        }, 800);
      } else {
        setRegError(result.error || 'Registration failed. Please try again.');
      }
    }, 500);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 bg-[#F5F0E8]">
      <div className="w-full max-w-md">
        {/* CerviXAI Title (Only title, no subtitle or tagline) */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2F3A3D]">
            CerviXAI
          </h1>
        </div>

        {/* Card Container */}
        <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl shadow-xs overflow-hidden">
          {viewMode === 'login' ? (
            /* VIEW 1: DOCTOR SIGN IN */
            <div className="p-6 sm:p-7">
              <div className="mb-5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3A3D]">
                  Doctor Sign In
                </h2>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>{loginError}</div>
                  </div>
                )}

                {/* Doctor Email / Registration ID */}
                <div>
                  <label 
                    htmlFor="login-identifier-input" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1.5"
                  >
                    Doctor Email / ID
                  </label>
                  <div className="relative rounded-md shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="w-4 h-4 text-[#5B6B6F]" />
                    </div>
                    <input
                      type="text"
                      id="login-identifier-input"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Doctor Email / ID"
                      className="block w-full rounded-md border border-[#DCD4C7] bg-white pl-9 pr-3.5 py-2 text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password & Forgot Password? */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="login-password-input" 
                      className="block text-xs font-semibold text-[#2F3A3D]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      id="login-forgot-password-btn"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotSubmitted(false);
                      }}
                      className="text-xs text-[#B85C38] hover:text-[#964726] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative rounded-md shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="w-4 h-4 text-[#5B6B6F]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password-input"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      className="block w-full rounded-md border border-[#DCD4C7] bg-white pl-9 pr-10 py-2 text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none"
                    />
                    <button
                      type="button"
                      id="login-toggle-password-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5B6B6F] hover:text-[#2F3A3D] cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs text-[#5B6B6F]">
                    <input
                      type="checkbox"
                      id="login-remember-me-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-[#DCD4C7] text-[#B85C38] focus:ring-[#B85C38] cursor-pointer accent-[#B85C38]"
                    />
                    <span className="text-[#2F3A3D] select-none font-medium">Remember me for 30 days</span>
                  </label>
                </div>

                {/* Sign In Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="login-sign-in-btn"
                    disabled={loginLoading}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs disabled:opacity-75 cursor-pointer"
                  >
                    {loginLoading ? (
                      <span className="inline-flex items-center">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                        Signing in...
                      </span>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </div>

                {/* Create Account Simple Text Link */}
                <div className="text-center pt-3 border-t border-[#DCD4C7]/60 mt-4">
                  <p className="text-xs text-[#5B6B6F]">
                    Don&apos;t have a registered clinical account?{' '}
                    <button
                      type="button"
                      id="login-create-account-link"
                      onClick={() => {
                        setViewMode('register');
                        setRegError(null);
                        setRegSuccessMessage(null);
                      }}
                      className="text-[#B85C38] font-semibold hover:underline cursor-pointer ml-0.5"
                    >
                      Create Doctor Account
                    </button>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* VIEW 2: CREATE DOCTOR ACCOUNT (SEPARATE VIEW) */
            <div className="p-6 sm:p-7">
              <div className="mb-5 pb-3 border-b border-[#DCD4C7]/60">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3A3D]">
                  Create Doctor Account
                </h2>
                <p className="text-xs text-[#5B6B6F] mt-1">
                  Enter your credentials to establish your personalized clinical workspace.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {regError && (
                  <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>{regError}</div>
                  </div>
                )}

                {regSuccessMessage && (
                  <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>{regSuccessMessage}</div>
                  </div>
                )}

                {/* Doctor Full Name */}
                <div>
                  <label 
                    htmlFor="reg-name-input" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1"
                  >
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    id="reg-name-input"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Dr. Priya Deshmukh"
                    className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs sm:text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none"
                  />
                </div>

                {/* Medical Registration Number */}
                <div>
                  <label 
                    htmlFor="reg-number-input" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1"
                  >
                    Medical Registration Number *
                  </label>
                  <input
                    type="text"
                    id="reg-number-input"
                    required
                    value={regRegNumber}
                    onChange={(e) => setRegRegNumber(e.target.value)}
                    placeholder="e.g. MCI-2019-48201"
                    className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs sm:text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none font-mono"
                  />
                </div>

                {/* Institutional Email */}
                <div>
                  <label 
                    htmlFor="reg-email-input" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1"
                  >
                    Doctor Email *
                  </label>
                  <input
                    type="email"
                    id="reg-email-input"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs sm:text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label 
                    htmlFor="reg-phone-input" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="reg-phone-input"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs sm:text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none"
                  />
                </div>

                {/* Hospital / Laboratory Name */}
                <div>
                  <label 
                    htmlFor="reg-hospital-input" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1"
                  >
                    Hospital / Laboratory Name *
                  </label>
                  <input
                    type="text"
                    id="reg-hospital-input"
                    required
                    value={regHospital}
                    onChange={(e) => setRegHospital(e.target.value)}
                    placeholder="e.g. City Cytopathology Laboratory"
                    className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs sm:text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/50 focus:border-[#B85C38] focus:outline-none"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label 
                    htmlFor="reg-specialization-select" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1"
                  >
                    Specialization *
                  </label>
                  <select
                    id="reg-specialization-select"
                    value={regSpecialization}
                    onChange={(e) => setRegSpecialization(e.target.value)}
                    className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs sm:text-sm text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
                  >
                    <option value="MD Cytopathology">MD Cytopathology</option>
                    <option value="MD Pathology">MD Pathology</option>
                    <option value="Gynaecologic Oncologist">Gynaecologic Oncologist</option>
                    <option value="Senior Consultant Pathologist">Senior Consultant Pathologist</option>
                    <option value="Preventive Oncology Specialist">Preventive Oncology Specialist</option>
                    <option value="Chief Medical Officer">Chief Medical Officer</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label 
                    htmlFor="reg-password-input" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1"
                  >
                    Password (min. 6 chars) *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      id="reg-password-input"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 pr-9 text-xs sm:text-sm text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5B6B6F] hover:text-[#2F3A3D]"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label 
                    htmlFor="reg-confirm-password-input" 
                    className="block text-xs font-semibold text-[#2F3A3D] mb-1"
                  >
                    Confirm Password *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="reg-confirm-password-input"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs sm:text-sm text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
                  />
                </div>

                {/* Create Account Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="register-submit-btn"
                    disabled={regLoading}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs disabled:opacity-75 cursor-pointer"
                  >
                    {regLoading ? (
                      <span className="inline-flex items-center">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                        Creating Account...
                      </span>
                    ) : (
                      <span>Create Doctor Account</span>
                    )}
                  </button>
                </div>

                {/* Back to Sign In Link */}
                <div className="text-center pt-3 border-t border-[#DCD4C7]/60 mt-3">
                  <p className="text-xs text-[#5B6B6F]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      id="register-back-to-login-btn"
                      onClick={() => {
                        setViewMode('login');
                        setRegError(null);
                      }}
                      className="text-[#B85C38] font-semibold hover:underline cursor-pointer ml-0.5"
                    >
                      Doctor Sign In
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-[#B85C38]/10 flex items-center justify-center text-[#B85C38]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#2F3A3D]">Doctor Account Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSubmitted(false);
                }}
                className="text-[#5B6B6F] hover:text-[#2F3A3D] p-1 rounded hover:bg-[#ECE4D6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!forgotSubmitted ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-[#2F3A3D] leading-relaxed">
                  Enter your registered institutional email. A secure recovery link and OTP instructions will be sent to your clinical inbox.
                </p>

                <div>
                  <label htmlFor="forgot-email-input" className="block text-xs font-semibold text-[#2F3A3D] mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    id="forgot-email-input"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs sm:text-sm text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSubmitted(false);
                    }}
                    className="px-3 py-1.5 text-xs text-[#5B6B6F] hover:text-[#2F3A3D] rounded border border-[#DCD4C7] bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B85C38] hover:bg-[#964726] rounded transition-colors"
                  >
                    Send Recovery Instructions
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 py-2">
                <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-md text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Recovery Dispatched</span>
                    Password recovery guidance has been dispatched to <strong>{forgotEmail}</strong>.
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSubmitted(false);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#B85C38] hover:bg-[#964726] rounded"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
