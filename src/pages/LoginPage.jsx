import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TextButton from "../views/TextButton"; // Assuming reusable button
import { FaUser, FaLock, FaUserTag, FaExclamationTriangle } from "react-icons/fa";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!userName || !password || !role) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        identifier: userName,
        password,
        role,
      });

      // Auth context login and token storage
      login(res.data.user);
      localStorage.setItem("authToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      // Role-based redirection (customize as needed)
      const redirectPath = res.data.user.role === "director" ? "/dashboard" : "/home";
      navigate(redirectPath);
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || err.message || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-section min-h-screen flex items-center justify-center bg-gray-100">
      <div className="welcome-container hidden md:flex flex-col justify-center items-center basis-1/2 bg-blue-600 text-white !p-12 rounded-l-xl shadow-xl">
        <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
        <h3 className="text-3xl !mb-2">Dream School</h3>
        <p className="text-lg text-center max-w-md">
          Get real-time analysis, manage your school data, and make informed decisions with ease.
        </p>
      </div>
      <div className="login-container basis-full md:basis-1/2 bg-white !p-12 rounded-r-xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 !mb-8 text-center">Login to Your Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                id="username"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full !pl-10 !pr-3 !py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
                aria-label="Username"
              />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 !mb-1">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full !pl-10 !pr-3 !py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                aria-label="Password"
              />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <FaUserTag className="absolute left-3 top-3 text-gray-400" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full !pl-10 !pr-3 !py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                required
                aria-label="Role"
              >
                <option value="">Select your role</option>
                <option value="director">Director</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                {/* Add more roles as needed */}
              </select>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 !p-3 rounded-md">
              <FaExclamationTriangle />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <TextButton
            name={loading ? "Signing In..." : "Sign In"}
            type="submit"
            disabled={loading}
            className="w-full"
          />
        </form>
        <p className="!mt-6 text-center text-sm text-gray-600">
          Forgot password? <a href="/forgot-password" className="text-blue-500 hover:underline">Reset here</a>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;