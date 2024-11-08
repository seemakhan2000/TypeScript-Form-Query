import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./login.css";

const API_URL = process.env.REACT_APP_API_URL;

interface FormData {
  phone: string;
  email: string;
  password: string;
  consent: boolean;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    email: "",
    password: "",
    consent: false,
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginUser = async (loginData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (data.success && data.data.token) {
        // Save the token in localStorage
        localStorage.setItem("token", data.data.token);
        toast.success("Login successful!");
        navigate("/form");
      } else {
        toast.error("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Server side error: ", error);
    }
  };

  const loginSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginUser(formData); // Proceed with login
  };

  return (
    <div className="login-form">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <form
            id="login-form"
            method="post"
            className="login-form"
            onSubmit={loginSubmission}
          >
            <h2 id="title" className="mb-4 text-center">
              Login
            </h2>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Enter Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="d-grid gap-2">
              <button
                type="submit"
                id="login-btn"
                className="btn btn-secondary"
              >
                Log in
              </button>
              <Link
                to="/signup"
                className="an"
                aria-label="Already have an account?"
              >
                Signup
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
