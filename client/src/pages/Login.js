
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { key } = useParams(); // from /auth/:key

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      console.log("Posting to:", `/auth/login`);

      // REAL ROUTE
      const res = await api.post(`/auth/login`, { email, password });

      if (res.data.token && res.data.author) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("author", JSON.stringify(res.data.author));

        setSuccess(true);
        navigate("/"); // go home after login
      } else {
        setError("Invalid server response");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!key) return <div>Access denied.</div>;

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Writer / Editor Login</h2>

        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">Success!</p>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
