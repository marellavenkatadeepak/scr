import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Shield, User } from 'lucide-react';
import { insforge } from '../../lib/insforge';

interface SignUpProps {
  onSignUp: () => void;
  onSwitchToSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await insforge.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || 'Sign up failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        setSuccess(true);
        // Auto sign in after successful sign up
        setTimeout(() => {
          onSignUp();
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FDF4FF] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white p-8 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-3xl mb-6">
            <Shield size={36} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Account Created!</h2>
          <p className="text-slate-500 text-lg">Redirecting you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF4FF] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-violet-200 to-pink-200 rounded-3xl mb-6 shadow-sm transform -rotate-3 hover:rotate-3 transition-transform duration-300">
            <User size={36} className="text-violet-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 text-lg">Sign up to get started</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl opacity-20 group-focus-within:opacity-50 transition duration-500 blur"></div>
            <div className="relative bg-white rounded-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl opacity-20 group-focus-within:opacity-50 transition duration-500 blur"></div>
            <div className="relative bg-white rounded-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                placeholder="Password (min. 6 characters)"
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl opacity-20 group-focus-within:opacity-50 transition duration-500 blur"></div>
            <div className="relative bg-white rounded-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center shadow-lg transition-all duration-300 ${
              loading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] cursor-pointer'
            }`}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </form>

        {/* Switch to Sign In */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToSignIn}
              className="text-violet-600 font-semibold hover:text-violet-700 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

