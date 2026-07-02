import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Signup() {
  const [, setAuthUser] = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const validatePasswordMatch = (value) => {
    return value === password || "Passwords do not match";
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
      }
      localStorage.setItem("ChatApp", JSON.stringify(response.data));
      setAuthUser(response.data);
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-4xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-slate-700/60 via-slate-900 to-sky-600/20 p-10">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.87L3 20l1.2-3.4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="mt-8 text-3xl font-semibold text-white">Create your social space.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                Start conversations, build communities, and enjoy a more refined messaging experience from the very first login.
              </p>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Personalized chat experience
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Easier group management and updates
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">Create account</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Sign up for LetsTalk</h1>
              <p className="mt-2 text-sm text-slate-400">Join the community and start connecting with friends and groups instantly.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <label className="input input-bordered flex h-12 items-center gap-2 rounded-2xl border-slate-700 bg-slate-800/80 text-slate-100 focus-within:border-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-slate-400">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input type="text" className="grow bg-transparent text-sm placeholder:text-slate-500" placeholder="Name" {...register("name", { required: true })} />
              </label>
              {errors.name && <span className="text-sm font-semibold text-rose-400">This field is required</span>}

              <label className="input input-bordered flex h-12 items-center gap-2 rounded-2xl border-slate-700 bg-slate-800/80 text-slate-100 focus-within:border-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-slate-400">
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input type="email" className="grow bg-transparent text-sm placeholder:text-slate-500" placeholder="Email" {...register("email", { required: true })} />
              </label>
              {errors.email && <span className="text-sm font-semibold text-rose-400">This field is required</span>}

              <label className="input input-bordered flex h-12 items-center gap-2 rounded-2xl border-slate-700 bg-slate-800/80 text-slate-100 focus-within:border-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-slate-400">
                  <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                </svg>
                <input type="password" className="grow bg-transparent text-sm placeholder:text-slate-500" placeholder="Password" {...register("password", { required: true })} />
              </label>
              {errors.password && <span className="text-sm font-semibold text-rose-400">This field is required</span>}

              <label className="input input-bordered flex h-12 items-center gap-2 rounded-2xl border-slate-700 bg-slate-800/80 text-slate-100 focus-within:border-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-slate-400">
                  <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                </svg>
                <input type="password" className="grow bg-transparent text-sm placeholder:text-slate-500" placeholder="Confirm password" {...register("confirmPassword", { required: true, validate: validatePasswordMatch })} />
              </label>
              {errors.confirmPassword && <span className="text-sm font-semibold text-rose-400">{errors.confirmPassword.message}</span>}

              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-3">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Profile picture (optional)</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="file-input file-input-bordered file-input-sm w-full border-slate-700 bg-slate-900 text-sm text-slate-200" />
                {imagePreview && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="h-14 w-14 rounded-full object-cover ring-2 ring-sky-400/40" />
                    <p className="text-sm text-slate-400">Your picture will appear in chats and conversations.</p>
                  </div>
                )}
              </div>

              <button type="submit" className="btn h-12 w-full rounded-2xl border-0 bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-600/20 transition hover:from-sky-400 hover:to-blue-500">
                Sign up
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Already have an account?
              <Link to="/login" className="ml-2 font-semibold text-sky-400 transition hover:text-sky-300">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;