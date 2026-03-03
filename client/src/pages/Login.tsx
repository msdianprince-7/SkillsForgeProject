import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const token = res.data.token;

      login(token);
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-96">
        <h2 className="text-2xl text-white mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 p-2 rounded text-black font-bold"
        >
          Login
        </button>

        <p className="text-gray-400 mt-4 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-green-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;