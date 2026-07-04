import axios from "axios";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const [, setAuthUser] = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    const userInfo = {
      email: data.email,
      password: data.password,
    };

    axios
      .post("/api/user/login", userInfo)
      .then((response) => {
        if (response.data?.user) {
          toast.success("Login successful");

          // ✅ Always store consistent shape: { user: {...} }
          const authPayload = { user: response.data.user };
          localStorage.setItem("ChatApp", JSON.stringify(authPayload));
          setAuthUser(authPayload);
        }
      })
      .catch((error) => {
        // ✅ Fallback error message
        const errorMsg = error.response?.data?.error || "Login failed";
        toast.error("Error: " + errorMsg);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl lg:rounded-4xl border border-slate-700/50 bg-slate-900/70 shadow-2xl shadow-black/60 backdrop-blur-md">
        <div className="p-6 sm:p-8 lg:p-12">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-sky-400/80">Welcome back</p>
            <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white">Login to your account</h1>
            <p className="mt-2 text-sm text-slate-400">Continue your conversations securely and instantly.</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <input
                    id="email"
                    type="email"
                    className="grow bg-transparent text-sm placeholder:text-slate-500 focus:outline-none"
                    placeholder="you@example.com"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email"
                      }
                    })}
                  />
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
                  <input
                    id="password"
                    type="password"
                    className="grow bg-transparent text-sm placeholder:text-slate-500 focus:outline-none"
                    placeholder="••••••••"
                    {...register("password", { required: "Password is required" })}
                  />
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

            {/* Submit Button */}
            <button
              type="submit"
              className="btn h-12 w-full rounded-2xl border-0 bg-linear-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-sky-500/25 transition duration-300 hover:from-sky-400 hover:to-blue-500 hover:shadow-blue-500/40 active:scale-95 mt-6"
            >
              Sign In
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?
              <Link to="/signup" className="ml-1.5 font-semibold text-sky-400 transition hover:text-sky-300 hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;