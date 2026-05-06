import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { insforge } from '../../lib/insforge';

interface SignInProps {
  onSignIn: () => void;
  onSwitchToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Sign in failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (data?.accessToken) {
        onSignIn();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF4FF] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-violet-200 to-pink-200 rounded-3xl mb-6 shadow-sm transform -rotate-3 hover:rotate-3 transition-transform duration-300">
            <Shield size={36} className="text-violet-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-lg">Sign in to your account</p>
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
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-violet-600 font-semibold hover:text-violet-700 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

