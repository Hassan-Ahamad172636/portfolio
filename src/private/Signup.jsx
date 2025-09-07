"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, UserPlus, Star, Rocket, Users, Upload } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: null, // Added for file upload
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("password", formData.password)
      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture)
      }

      const response = await axios.post("http://localhost:5000/user/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const { success, message, data } = response.data
      if (success) {
        // Store token in localStorage
        localStorage.setItem("token", data.token)
        setSuccess(message)
        // Redirect to dashboard or another page after a short delay
        setTimeout(() => navigate("/admin"), 2000)
      } else {
        setError(message)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    }
  }

  const handleChange = (e) => {
    if (e.target.name === "profilePicture") {
      setFormData({
        ...formData,
        profilePicture: e.target.files[0], // Store the selected file
      })
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      })
    }
  }

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Left Side - Join Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-accent-secondary/20 to-accent/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl font-bold text-text-primary mb-6 leading-tight">
              Join Our
              <span className="text-accent-secondary block">Creative Community</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              Start your journey with us and unlock powerful tools to showcase your work and manage your portfolio like
              never before.
            </p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-accent-secondary/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-accent-secondary" />
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold">Premium Features</h3>
                  <p className="text-text-secondary">Access to advanced portfolio management tools</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold">Launch Faster</h3>
                  <p className="text-text-secondary">Get your portfolio online in minutes, not hours</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold">Community Support</h3>
                  <p className="text-text-secondary">Connect with other creators and professionals</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Create Account</h1>
            <p className="text-text-secondary">Join us and start your journey</p>
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
              <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-sidebar border border-slate-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-secondary focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-sidebar border border-slate-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-secondary focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-sidebar border border-slate-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-secondary focus:border-transparent transition-all duration-200"
                  placeholder="Create a password"
                  required
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

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-sidebar border border-slate-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-secondary focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <label className="block text-sm font-medium text-text-primary mb-2">Profile Picture (Optional)</label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-sidebar border border-slate-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-secondary focus:border-transparent transition-all duration-200"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-accent-secondary bg-primary border-slate-600 rounded focus:ring-accent-secondary focus:ring-2 mt-1"
                  required
                />
                <span className="ml-2 text-sm text-text-secondary">
                  I agree to the{" "}
                  <Link to="/terms" className="text-accent-secondary hover:text-accent transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/ privacy" className="text-accent-secondary hover:text-accent transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-accent hover:from-accent-secondary/90 hover:to-accent/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center group shadow-lg"
            >
              Create Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-8 text-center"
          >
            <p className="text-text-secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-accent-secondary hover:text-accent transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
  </div>
</div>
  )
}