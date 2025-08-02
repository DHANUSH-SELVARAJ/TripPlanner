import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { register } from "./userService";
import { FaUserCircle } from "react-icons/fa";
import { formStyles as s } from "../styles/tailwind";
import { compressImage } from "../Utilites/helper";

export default function Register() {
  const navigate = useNavigate();

  // Password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile: { picture: null }, // Base64 stored here
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef(null);

  // Password rules
  const passwordRules = {
    length: { test: (p) => p.length >= 8, message: "At least 8 characters" },
    upper: { test: (p) => /[A-Z]/.test(p), message: "At least one uppercase letter" },
    number: { test: (p) => /\d/.test(p), message: "At least one number" },
    special: { test: (p) => /[@$!%*?&]/.test(p), message: "At least one special character" },
  };

  // Validators
  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password) => {
    const failedRule = Object.values(passwordRules).find((rule) => !rule.test(password));
    return failedRule ? failedRule.message : "";
  };

  const getPasswordStrength = (password) => {
    const passed = Object.values(passwordRules).filter((rule) => rule.test(password)).length;
    if (passed <= 1) return { label: "Weak", color: "bg-red-500 w-1/3" };
    if (passed <= 3) return { label: "Medium", color: "bg-yellow-500 w-2/3" };
    return { label: "Strong", color: "bg-green-500 w-full" };
  };

  // Derived states
  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const emailError = useMemo(() => validateEmail(formData.email), [formData.email]);
  const passwordError = useMemo(() => validatePassword(formData.password), [formData.password]);
  const confirmPasswordError = useMemo(() =>
    formData.confirmPassword && formData.confirmPassword !== formData.password
      ? "Passwords do not match"
      : "",
    [formData.confirmPassword, formData.password]
  );

  // Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleBlur = (field) => setTouched({ ...touched, [field]: true });
  const showError = (field) => (touched[field] || submitted) && errors[field];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const finalErrors = {
      name: !formData.name ? "Full name is required" : "",
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError || (!formData.confirmPassword ? "Confirm password is required" : ""),
    };
    setErrors(finalErrors);
    if (Object.values(finalErrors).some((err) => err)) return;
    const success = register(formData);
    if (success) navigate("/map");
    else setErrors({ general: "User already exists. Please login." });
  };

  // 🔄 Convert uploaded image to Base64 to avoid blob issues
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
    compressImage(file, (compressedBase64) => {
        setFormData((prev) => ({
          ...prev,
          profile: { picture: compressedBase64}, // Base64 stored
        }));
    });
    }
  };

  return (
    <div className={s.container}>
      <div className={s.card}>
        <h1 className={s.title}>Register</h1>
        {errors.general && <p className={s.errorGeneral}>{errors.general}</p>}
        
        <form onSubmit={handleSubmit} className={s.form}>
          {/* Profile Upload */}
          <div className={s.profile.wrapper}>
            {formData.profile?.picture ? (
              <div className={s.profile.previewWrapper}>
                <img src={formData.profile.picture} alt="Profile" className={s.profile.previewImage} />
                <button type="button" className={s.profile.removeButton} onClick={() => setFormData((prev) => ({ ...prev, profile: { picture: null } }))}>
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current.click()} className={s.profile.uploadButton}>
                <FaUserCircle className={s.profile.icon} size={40} />
                <span className={s.profile.uploadText}>Upload</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Name */}
          <div>
            <label className={s.label}>Full Name <span className={s.required}>*</span></label>
            <input name="name" value={formData.name} onChange={handleChange} onBlur={() => handleBlur("name")}
              className={`${s.inputBase} ${showError("name") ? s.inputError : ""}`} />
            {showError("name") && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className={s.inputWrapper}>
            <label className={s.label}>Email <span className={s.required}>*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={() => handleBlur("email")}
              className={`${s.inputBase} ${showError("email") ? s.inputError : ""}`} />
            {(touched.email || submitted) && formData.email && (
              emailError
                ? <XCircleIcon className={`${s.icon.invalid} ${s.inputIconRight}`} />
                : <CheckCircleIcon className={`${s.icon.valid} ${s.inputIconRight}`} />
            )}
            {showError("email") && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className={s.inputWrapper}>
            <label className={s.label}>Password <span className={s.required}>*</span></label>
            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
              className={`${s.inputBase} ${showError("password") ? s.inputError : ""}`} />
            <button type="button" className={s.inputIconRight} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeSlashIcon className={s.icon.eye} /> : <EyeIcon className={s.icon.eye} />}
            </button>
            {showError("password") && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            {formData.password && (
              <>
                <div className={s.passwordStrengthBar}>
                  <div className={s.passwordStrengthInner[passwordStrength.label.toLowerCase()]}></div>
                </div>
                <p className={s.passwordStrengthLabel[passwordStrength.label.toLowerCase()]}>
                  Strength: {passwordStrength.label}
                </p>
              </>
            )}
          </div>

          {/* Confirm Password */}
          <div className={s.inputWrapper}>
            <label className={s.label}>Confirm Password <span className={s.required}>*</span></label>
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              className={`${s.inputBase} ${showError("confirmPassword") ? s.inputError : ""}`} />
            <button type="button" className={s.inputIconRight} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeSlashIcon className={s.icon.eye} /> : <EyeIcon className={s.icon.eye} />}
            </button>
            {showError("confirmPassword") && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button type="submit" className={s.buttonPrimary}>Register</button>
        </form>

        <p className={s.footer}>
          Already have an account?{" "}
          <button className={s.link} onClick={() => navigate("/login")}>Login</button>
        </p>
      </div>
    </div>
  );
}
