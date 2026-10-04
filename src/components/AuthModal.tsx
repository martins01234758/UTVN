import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  ArrowRight, 
  ExternalLink,
  Smartphone,
  Info
} from 'lucide-react';
import { User, ConfirmationResult } from 'firebase/auth';
import { 
  signInWithGoogle, 
  signInWithMicrosoft, 
  signInWithApple, 
  signInWithEmail, 
  registerWithEmail, 
  sendPasswordReset, 
  sendMobileOtp, 
  verifyMobileOtp, 
  logout 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
}

type AuthMethod = 'google' | 'microsoft' | 'apple' | 'email' | 'phone';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('google');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState('+1');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const resetFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // 1. Google OAuth
  const handleGoogleAuth = async () => {
    resetFeedback();
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        onAuthSuccess(res.user);
        setSuccessMsg(`Welcome, ${res.user.displayName || res.user.email}!`);
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Microsoft OAuth
  const handleMicrosoftAuth = async () => {
    resetFeedback();
    setIsLoading(true);
    try {
      const res = await signInWithMicrosoft();
      if (res?.user) {
        onAuthSuccess(res.user);
        setSuccessMsg(`Welcome, ${res.user.displayName || res.user.email}!`);
      }
    } catch (err: any) {
      console.error('Microsoft Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Microsoft provider is not yet enabled in your Firebase Console. See instructions below.');
      } else {
        setErrorMsg(err.message || 'Microsoft authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Apple OAuth
  const handleAppleAuth = async () => {
    resetFeedback();
    setIsLoading(true);
    try {
      const res = await signInWithApple();
      if (res?.user) {
        onAuthSuccess(res.user);
        setSuccessMsg(`Welcome, ${res.user.displayName || res.user.email}!`);
      }
    } catch (err: any) {
      console.error('Apple Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Apple provider is not yet enabled in your Firebase Console. See instructions below.');
      } else {
        setErrorMsg(err.message || 'Apple authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Email / Password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      if (isRegisterMode) {
        const user = await registerWithEmail(email, password, displayName);
        onAuthSuccess(user);
        setSuccessMsg(`Account created successfully for ${user.email}!`);
      } else {
        const user = await signInWithEmail(email, password);
        onAuthSuccess(user);
        setSuccessMsg(`Signed in successfully as ${user.email}!`);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email/Password provider is not yet enabled in your Firebase Console. See instructions below.');
      } else {
        setErrorMsg(err.message || 'Email authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address to receive password reset instructions.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccessMsg(`Password reset email sent to ${email}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Mobile Phone Number & SMS OTP
  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    if (!phoneNumber.startsWith('+') || phoneNumber.length < 8) {
      setErrorMsg('Please enter a valid international phone number starting with + (e.g. +14155552671 or +919876543210)');
      return;
    }
    setIsLoading(true);
    try {
      const confirmation = await sendMobileOtp(phoneNumber, 'recaptcha-verifier-container');
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccessMsg(`Verification SMS sent to ${phoneNumber}. Enter the 6-digit code below.`);
    } catch (err: any) {
      console.error('Phone Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Phone Authentication is not yet enabled in your Firebase Console. See instructions below.');
      } else {
        setErrorMsg(err.message || 'Failed to send SMS verification code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    if (!confirmationResult || !verificationCode) {
      setErrorMsg('Please enter the 6-digit SMS code.');
      return;
    }
    setIsLoading(true);
    try {
      const user = await verifyMobileOtp(confirmationResult, verificationCode);
      onAuthSuccess(user);
      setSuccessMsg(`Phone number verified successfully! Signed in as ${user.phoneNumber}`);
    } catch (err: any) {
      console.error('OTP Verify Error:', err);
      setErrorMsg(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setSuccessMsg('Signed out successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign out failed.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      {/* Invisible container for phone reCAPTCHA */}
      <div id="recaptcha-verifier-container"></div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Enterprise Identity & Authentication
              </h2>
              <p className="text-xs text-slate-500">
                Sign in with Google, Microsoft Entra ID, Apple, Corporate Email, or Mobile OTP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Status (if logged in) */}
        {currentUser && (
          <div className="m-6 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {currentUser.displayName || currentUser.email || currentUser.phoneNumber || 'Authenticated User'}
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-semibold">
                    ACTIVE SESSION
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {currentUser.email || currentUser.phoneNumber} · UID: {currentUser.uid.slice(0, 10)}...
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50/50 text-xs font-semibold">
          <button
            onClick={() => { setSelectedMethod('google'); resetFeedback(); }}
            className={`py-3 px-2 flex flex-col items-center gap-1.5 border-b-2 transition-colors ${
              selectedMethod === 'google' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => { setSelectedMethod('microsoft'); resetFeedback(); }}
            className={`py-3 px-2 flex flex-col items-center gap-1.5 border-b-2 transition-colors ${
              selectedMethod === 'microsoft' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            <span>Microsoft</span>
          </button>

          <button
            onClick={() => { setSelectedMethod('apple'); resetFeedback(); }}
            className={`py-3 px-2 flex flex-col items-center gap-1.5 border-b-2 transition-colors ${
              selectedMethod === 'apple' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4 fill-current text-slate-800" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.64-7.85-11.83-14.34-5.7-8.86-10.15-18.78-13.35-29.75-3.2-10.98-4.8-21.78-4.8-32.41 0-14.35 3.6-26.4 10.8-36.14 7.2-9.74 16.4-14.65 27.6-14.73 4.8 0 10.1 1.2 15.9 3.6 5.8 2.4 9.5 3.6 11.1 3.6 1.4 0 5.4-1.3 12-3.9 6.6-2.6 12.3-3.8 17.1-3.6 12.8.6 23.1 5.3 30.9 14.1-11.4 6.9-17 16.5-16.8 28.8.2 9.6 3.9 17.6 11.1 24 7.2 6.4 15.8 10 25.8 10.8-2.6 7.6-5.8 15.1-9.6 22.5zM119.22 31.42c0-7.3 2.6-14 7.8-20.1 5.2-6.1 11.6-9.9 19.2-11.3 0 1.2.1 2.3.1 3.3 0 7.1-2.8 13.9-8.4 20.4-5.6 6.5-12.3 10.3-20.1 11.4-.2-1.2-.6-2.4-.6-3.7z"/>
            </svg>
            <span>Apple</span>
          </button>

          <button
            onClick={() => { setSelectedMethod('email'); resetFeedback(); }}
            className={`py-3 px-2 flex flex-col items-center gap-1.5 border-b-2 transition-colors ${
              selectedMethod === 'email' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>

          <button
            onClick={() => { setSelectedMethod('phone'); resetFeedback(); }}
            className={`py-3 px-2 flex flex-col items-center gap-1.5 border-b-2 transition-colors ${
              selectedMethod === 'phone' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* 1. GOOGLE */}
          {selectedMethod === 'google' && (
            <div className="text-center py-4 space-y-4">
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Google Workspace SSO</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Authenticate via Google with configured Google Drive and Google Sheets scopes for automated ledger exports and verification.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  {isLoading ? 'Connecting Google Account...' : 'Continue with Google'}
                </button>
              </div>
            </div>
          )}

          {/* 2. MICROSOFT */}
          {selectedMethod === 'microsoft' && (
            <div className="text-center py-4 space-y-4">
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Microsoft Entra ID / 365</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Single Sign-On for enterprise finance and ERP teams using Microsoft 365, Azure Active Directory, and Outlook.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleMicrosoftAuth}
                  disabled={isLoading}
                  className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  {isLoading ? 'Connecting Microsoft...' : 'Continue with Microsoft'}
                </button>
              </div>
            </div>
          )}

          {/* 3. APPLE */}
          {selectedMethod === 'apple' && (
            <div className="text-center py-4 space-y-4">
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Sign in with Apple</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Secure biometrics and privacy-focused authentication for CFO and executive signatories on Apple devices.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleAppleAuth}
                  disabled={isLoading}
                  className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.64-7.85-11.83-14.34-5.7-8.86-10.15-18.78-13.35-29.75-3.2-10.98-4.8-21.78-4.8-32.41 0-14.35 3.6-26.4 10.8-36.14 7.2-9.74 16.4-14.65 27.6-14.73 4.8 0 10.1 1.2 15.9 3.6 5.8 2.4 9.5 3.6 11.1 3.6 1.4 0 5.4-1.3 12-3.9 6.6-2.6 12.3-3.8 17.1-3.6 12.8.6 23.1 5.3 30.9 14.1-11.4 6.9-17 16.5-16.8 28.8.2 9.6 3.9 17.6 11.1 24 7.2 6.4 15.8 10 25.8 10.8-2.6 7.6-5.8 15.1-9.6 22.5zM119.22 31.42c0-7.3 2.6-14 7.8-20.1 5.2-6.1 11.6-9.9 19.2-11.3 0 1.2.1 2.3.1 3.3 0 7.1-2.8 13.9-8.4 20.4-5.6 6.5-12.3 10.3-20.1 11.4-.2-1.2-.6-2.4-.6-3.7z"/>
                  </svg>
                  {isLoading ? 'Connecting Apple...' : 'Sign in with Apple'}
                </button>
              </div>
            </div>
          )}

          {/* 4. EMAIL & PASSWORD */}
          {selectedMethod === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {isRegisterMode ? 'Create Corporate Account' : 'Corporate Email Login'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRegisterMode ? 'Register enterprise account with business email' : 'Sign in with your email address and password'}
                </p>
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Full Name / Designation
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. John Doe, Treasury Director"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.com"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  {!isRegisterMode && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                {isRegisterMode ? 'Create Account' : 'Sign In with Email'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(!isRegisterMode); resetFeedback(); }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                </button>
              </div>
            </form>
          )}

          {/* 5. MOBILE PHONE NUMBER */}
          {selectedMethod === 'phone' && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Mobile SMS OTP Verification</h3>
                <p className="text-xs text-slate-500">
                  Authenticate using SMS One-Time Passcode (OTP) via Firebase Phone Authentication
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendMobileOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      International Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+14155552671 or +919876543210"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Include international country code with + sign.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                    Send Verification Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      6-Digit SMS Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center text-sm font-bold tracking-widest text-slate-900 font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block text-center">
                      Code sent to {phoneNumber}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Verify & Sign In
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setVerificationCode(''); }}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Change phone number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Firebase Console Configuration Walkthrough */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Firebase Authentication Console Activation Guide</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                By default in Google Cloud / Firebase, only <strong>Google Sign-In</strong> is activated automatically. To enable Microsoft, Apple, Email/Password, or Phone Auth in production on project <span className="font-mono text-slate-800 font-semibold">gen-lang-client-0897913406</span>:
              </p>
              <ol className="list-decimal list-inside text-[11px] text-slate-700 space-y-1 font-mono">
                <li>Open Firebase Console &gt; Authentication &gt; Sign-in method</li>
                <li>Enable: <span className="text-emerald-700 font-semibold">Microsoft</span> (Enter Application ID & Secret from Azure Portal)</li>
                <li>Enable: <span className="text-slate-800 font-semibold">Apple</span> (Enter Services ID, Apple Team ID & Private Key)</li>
                <li>Enable: <span className="text-emerald-700 font-semibold">Email/Password</span> (Toggle Enable switch)</li>
                <li>Enable: <span className="text-emerald-700 font-semibold">Phone</span> (Toggle Enable switch; add test phone numbers for instant test validation)</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Firebase Auth Client v12 Active
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
