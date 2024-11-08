import React, { useState } from "react";
import { useAddUserMutation } from "../../mutation/mutation";
import { FormValue } from "../type/type";

interface ValidationError {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
}

interface UserFormProps {
  onFormSubmit: () => void;
}

const Form: React.FC<UserFormProps> = ({ onFormSubmit }) => {
  const [formValue, setFormValue] = useState<FormValue>({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError>({});

  const mutation = useAddUserMutation(onFormSubmit);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValue({ ...formValue, [name]: value });
  };

  const handleValidation = (): boolean => {
    let errors: ValidationError = {};
    let isValid = true;

    if (!formValue.username) {
      errors.username = "Username is required";
      isValid = false;
    }
    if (!formValue.email) {
      errors.email = "Email is required";
      isValid = false;
    }
    if (!formValue.phone) {
      errors.phone = "Phone is required";
      isValid = false;
    }
    if (!formValue.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (handleValidation()) {
      mutation.mutate(formValue, {
        onSuccess: () => {
          // Reset form values after successful submission
          setFormValue({
            username: "",
            email: "",
            phone: "",
            password: "",
          });
        },
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name:
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="username"
            value={formValue.username}
            onChange={handleInput}
          />
          {validationErrors.username && (
            <small className="text-danger">{validationErrors.username}</small>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formValue.email}
            onChange={handleInput}
          />
          {validationErrors.email && (
            <small className="text-danger">{validationErrors.email}</small>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">
            Phone:
          </label>
          <input
            type="text"
            className="form-control"
            id="phone"
            name="phone"
            value={formValue.phone}
            onChange={handleInput}
          />
          {validationErrors.phone && (
            <small className="text-danger">{validationErrors.phone}</small>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formValue.password}
            onChange={handleInput}
          />
          {validationErrors.password && (
            <small className="text-danger">{validationErrors.password}</small>
          )}
        </div>
        <div className="modal-footer">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default Form;
