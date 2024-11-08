import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./signup.css";

const API_URL = process.env.REACT_APP_API_URL;

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
}

interface FormErrors {
  username: string;
  email: string;
  phone: string;
  password: string;
}

interface ResponseData {
  message: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const navigate = useNavigate();

  const signupMutation = useMutation<ResponseData, Error, FormData>(
    (formData: FormData) =>
      fetch(`${API_URL}/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "Network response was not ok");
          });
        }
        return response.json();
      }),
    {
      onSuccess: (data: ResponseData) => {
        if (data.message === "Signup successful") {
          toast.success("Signup successful");
          console.log("Signup successful :", data);
          navigate("/login");
        } else {
          toast("Signup successful but received unexpected response");
        }
      },
      onError: (error: Error) => {
        toast.error(`Signup failed: ${error.message}`);
      },
    }
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      username: "",
      email: "",
      phone: "",
      password: "",
    };
    let isValid = true;

    if (formData.username.trim().length < 5) {
      errors.username = "Username must be at least 5 characters";
      isValid = false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      signupMutation.mutate(formData);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <form
          id="signup-form"
          method="post"
          className="signup-form"
          onSubmit={handleSubmit}
        >
          <h2 id="title" className="mb-4 text-center">
            Sign up
          </h2>

          <div className="mb-3">
            <input
              id="username-field"
              type="text"
              className={`form-control ${
                formErrors.username ? "is-invalid" : ""
              }`}
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />
            <small className="text-danger">{formErrors.username}</small>
          </div>

          <div className="mb-3">
            <input
              type="email"
              className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <small className="text-danger">{formErrors.email}</small>
          </div>

          <div className="mb-3">
            <input
              id="phone-field"
              type="text"
              className={`form-control ${formErrors.phone ? "is-invalid" : ""}`}
              placeholder="Phone number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="phone"
            />
            <small className="text-danger">{formErrors.phone}</small>
          </div>

          <div className="mb-3">
            <input
              type="password"
              className={`form-control ${
                formErrors.password ? "is-invalid" : ""
              }`}
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <small className="text-danger">{formErrors.password}</small>
          </div>

          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              defaultChecked
              name="remember"
              id="remember"
            />
            <label className="form-check-label" htmlFor="remember">
              Remember me
            </label>
          </div>

          <div className="d-grid gap-2">
            <button type="submit" id="Signup-button" className="Signup-button">
              Sign up
            </button>

            <Link
              to="/login"
              className="custom-link-class"
              aria-label="Already have an account?"
            >
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
