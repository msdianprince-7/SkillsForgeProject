import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-96">
        <h2 className="text-2xl text-white mb-4">Register</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
        />

        <button className="w-full bg-green-500 p-2 rounded text-black font-bold">
          Register
        </button>

      </div>
    </div>
  );
}

export default Register;