import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Signup() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const validatePasswordMatch = (value) => {
    return value === getValues("password") || "Passwords do not match";
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    if (selectedImage) {
      formData.append("profilePicture", selectedImage);
    }

    try {
      const response = await axios.post("/api/user/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        toast.success("Signup successful! You can Login now.");
        navigate("/login");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Signup failed";
      toast.error(errorMessage);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl lg:rounded-4xl border border-slate-700/50 bg-slate-900/70 shadow-2xl shadow-black/60 backdrop-blur-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8 lg:p-12">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-sky-400/80">Create account</p>
            <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white">Join LetsTalk</h1>
            <p className="mt-2 text-sm text-slate-400">Connect with friends and groups instantly.</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                Full Name
              </label>
              <div className="relative flex items-center">
                <label className="input input-bordered flex h-12 w-full items-center gap-3 rounded-2xl border-slate-600/50 bg-slate-800/40 text-slate-100 transition focus-within:border-sky-400/70 focus-within:bg-slate-800/60 hover:border-slate-500/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5 shrink-0 text-slate-500">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                  </svg>
                  <input id="name" type="text" className="grow bg-transparent text-sm placeholder:text-slate-500 focus:outline-none" placeholder="John Doe" {...register("name", { required: "Full name is required" })} />
                </label>
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-rose-400/90 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                Email Address
              </label>
              <div className="relative flex items-center">
                <label className="input input-bordered flex h-12 w-full items-center gap-3 rounded-2xl border-slate-600/50 bg-slate-800/40 text-slate-100 transition focus-within:border-sky-400/70 focus-within:bg-slate-800/60 hover:border-slate-500/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5 shrink-0 text-slate-500">
                    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                  </svg>
                  <input id="email" type="email" className="grow bg-transparent text-sm placeholder:text-slate-500 focus:outline-none" placeholder="you@example.com" {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" } })} />
                </label>
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-rose-400/90 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                Password
              </label>
              <div className="relative flex items-center">
                <label className="input input-bordered flex h-12 w-full items-center gap-3 rounded-2xl border-slate-600/50 bg-slate-800/40 text-slate-100 transition focus-within:border-sky-400/70 focus-within:bg-slate-800/60 hover:border-slate-500/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5 shrink-0 text-slate-500">
                    <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                  </svg>
                  <input id="password" type="password" className="grow bg-transparent text-sm placeholder:text-slate-500 focus:outline-none" placeholder="••••••••" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
                </label>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-rose-400/90 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <label className="input input-bordered flex h-12 w-full items-center gap-3 rounded-2xl border-slate-600/50 bg-slate-800/40 text-slate-100 transition focus-within:border-sky-400/70 focus-within:bg-slate-800/60 hover:border-slate-500/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5 shrink-0 text-slate-500">
                    <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                  </svg>
                  <input id="confirmPassword" type="password" className="grow bg-transparent text-sm placeholder:text-slate-500 focus:outline-none" placeholder="••••••••" {...register("confirmPassword", { required: "Please confirm your password", validate: validatePasswordMatch })} />
                </label>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-rose-400/90 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Profile Picture Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                Profile Picture <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <div className="relative">
                <div className="rounded-2xl border border-slate-600/50 bg-slate-800/40 p-4 transition hover:border-slate-500/80">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="file-input file-input-sm w-full text-sm text-slate-300 cursor-pointer" />
                  <p className="mt-2 text-xs text-slate-400">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
                </div>
                {imagePreview && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-sky-400/10 border border-sky-400/30 p-3">
                    <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded-full object-cover ring-2 ring-sky-400/40" />
                    <div>
                      <p className="text-sm font-semibold text-sky-400">Profile picture selected ✓</p>
                      <p className="text-xs text-slate-400">Ready to upload</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn h-12 w-full rounded-2xl border-0 bg-linear-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-sky-500/25 transition duration-300 hover:from-sky-400 hover:to-blue-500 hover:shadow-blue-500/40 active:scale-95 mt-6">
              Create Account
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?
              <Link to="/login" className="ml-1.5 font-semibold text-sky-400 transition hover:text-sky-300 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;