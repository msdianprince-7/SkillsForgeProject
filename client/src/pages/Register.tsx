import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-500 text-white font-bold text-xl mb-4 shadow-lg shadow-accent-500/25">
            SF
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-400 to-primary-300 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-surface-200/60 mt-2 text-sm">Join SkillForge and start tracking your skills</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleRegister}
          className="bg-surface-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl shadow-black/20"
        >
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-surface-200 mb-2">Full Name</label>
              <input
                id="register-name"
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white placeholder:text-surface-200/40 focus:border-accent-400/50 focus:ring-2 focus:ring-accent-400/20 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-surface-200 mb-2">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white placeholder:text-surface-200/40 focus:border-accent-400/50 focus:ring-2 focus:ring-accent-400/20 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-surface-200 mb-2">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white placeholder:text-surface-200/40 focus:border-accent-400/50 focus:ring-2 focus:ring-accent-400/20 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-surface-200 mb-2">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white placeholder:text-surface-200/40 focus:border-accent-400/50 focus:ring-2 focus:ring-accent-400/20 transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="register-submit-btn"
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-primary-500 text-white font-semibold hover:from-accent-400 hover:to-primary-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-500/20 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-surface-200/50 mt-6 text-sm">
            Already have an account?{" "}
            <Link to="/" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;