"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Shield, Zap } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useToast } from 'ai-toast'

export default function LoginPage() {
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.email || !formData.password) {
      showToast('All fields are required!')
      return
    }

    try {
      const response = await axios.post(import.meta.env.VITE_APP_BASE_URL + "user/login", {
        email: formData.email,
        password: formData.password,
      })

      const { success, message, data } = response.data
      if (success) {
        // Store token in localStorage
        localStorage.setItem("token", data.token)
        setSuccess(message)
        showToast('User logged in successfully!')
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate("/admin"), 2000)
      } else {
        showToast('Something went wrong!')
        setError(message)
      }
    } catch (err) {
      showToast(err.response?.data?.message)
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Left Side - Welcome Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-secondary/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl font-bold text-text-primary mb-6 leading-tight">
              Welcome to Your
              <span className="text-accent block">Admin Dashboard</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              Manage your portfolio, track analytics, and control your content with our powerful admin interface.
            </p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold">Secure Access</h3>
                  <p className="text-text-secondary">Advanced security features to protect your data</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-accent-secondary/10 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent-secondary" />
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold">Lightning Fast</h3>
                  <p className="text-text-secondary">Optimized performance for seamless experience</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-sidebar/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h1>
              <p className="text-text-secondary">Sign in to your account</p>
            </motion.div>

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-green-500/10 text-green-500 rounded-lg text-center"
              >
                {success}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-sidebar border border-slate-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-sidebar border border-slate-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-accent bg-primary border-slate-600 rounded focus:ring-accent focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-text-secondary">Remember me</span>
                </label>
                {/* <Link
                  to="/auth/forgot-password"
                  className="text-sm text-accent hover:text-accent-secondary transition-colors"
                >
                  Forgot password?
                </Link> */}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="cursor-pointer w-full bg-accent hover:from-accent/90 hover:to-accent-secondary/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center group shadow-lg"
              >
                Sign In
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 text-center"
            >
              <p className="text-text-secondary">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-accent hover:text-accent-secondary transition-colors font-medium"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}