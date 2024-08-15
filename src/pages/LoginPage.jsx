import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {login} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sending request to the backend
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        identifier: userName,
        password: password,
        role: role,
      });
      console.log(res)
      login(res.data.user);
      // Store the received token in localStorage
      localStorage.setItem("authToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      setError(`Invalid credentials ${error}`);
    }
  };

  return (
    <section className="login_section">
      <div className="welcome_container">
        <h1>Welcome Back</h1>
        <h3>Dream School</h3>
        <p>Get Analysis and your School Data</p>
      </div>
      <div>
        <div className="login_container" >
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}> {/* Change here: use 'form' and 'onSubmit' */}
        <div>
          <label>User Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        {error && <p>{error}</p>} {/* Display error message if exists */}
        <button type="submit">Login</button>
      </form>
    </div>
      </div>
    </section>
    
  );
};

export default LoginPage;
