import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Camera, Save, Mail, Lock, Shield, Check, Eye, EyeOff, Trash2, Loader2, X, Settings2 } from "lucide-react";
import axios from "axios";
import { useToast } from "ai-toast";

const SettingsPage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState("/professional-avatar.jpg");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    createdAt: "",
    lastLogin: "",
    profilePicture: "/professional-avatar.jpg",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const modalRef = useRef(null);

  // Focus trap for delete modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showDeleteModal) {
        setShowDeleteModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDeleteModal]);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("Authentication token is missing");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}user/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { success, data } = response.data;
        console.log("Fetch Profile Response:", response.data); // Debug
        if (success) {
          setProfileData({
            id: data.id || "",
            name: data.name || "",
            email: data.email || "",
            role: data.role || "",
            createdAt: data.createdAt || "",
            lastLogin: data.lastLogin || "",
            profilePicture: data.profilePicture || "/professional-avatar.jpg",
          });
          setProfileImage(data.profilePicture || "/professional-avatar.jpg");
          showToast("Profile fetched successfully");
        } else {
          showToast(response.data.message || "Failed to fetch profile");
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        showToast(err.response?.data?.message || "Failed to fetch profile. Please try again.");
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      showToast("No file selected");
      return;
    }
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Authentication token is missing");
        return;
      }
      const formData = new FormData();
      formData.append("profilePicture", file);
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);
      const response = await axios.put(`${import.meta.env.VITE_APP_BASE_URL}user/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const { success, message, data } = response.data;
      console.log("Image Upload Response:", response.data); // Debug
      if (success) {
        const newProfilePicture = data.user?.profilePicture || data.profilePicture || "/professional-avatar.jpg";
        setProfileImage(newProfilePicture);
        setProfileData((prev) => ({ ...prev, profilePicture: newProfilePicture }));
        showToast(message || "Profile picture updated successfully");
      } else {
        showToast(message || "Failed to update profile picture");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      if (err.response?.status === 401) {
        showToast("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        showToast(err.response?.data?.message || "Failed to upload image. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name || !profileData.email) {
      showToast("Name and email are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      showToast("Please enter a valid email address");
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Authentication token is missing");
        return;
      }
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}user/me`,
        {
          name: profileData.name,
          email: profileData.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { success, message, data } = response.data;
      console.log("Save Profile Response:", response.data); // Debug
      if (success) {
        setProfileData((prev) => ({
          ...prev,
          name: data.user?.name || data.name || prev.name,
          email: data.user?.email || data.email || prev.email,
          profilePicture: data.user?.profilePicture || data.profilePicture || prev.profilePicture,
        }));
        showToast(message || "Profile updated successfully");
      } else {
        showToast(message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      if (err.response?.status === 401) {
        showToast("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        showToast(err.response?.data?.message || "Failed to update profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast("All password fields are required");
      return;
    }
    setIsSaving(true);
    try {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordData.newPassword)) {
        showToast(
          "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character"
        );
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showToast("New passwords do not match");
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Authentication token is missing");
        return;
      }
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}user/password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { success, message } = response.data;
      console.log("Save Password Response:", response.data); // Debug
      if (success) {
        showToast(message || "Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showToast(message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update error:", err);
      if (err.response?.status === 401) {
        showToast("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        showToast(err.response?.data?.message || "Failed to update password. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Authentication token is missing");
        return;
      }
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}user/delete/${profileData.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { success, message } = response.data;
      console.log("Delete Account Response:", response.data); // Debug
      if (success) {
        showToast(message || "Account deleted successfully");
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showToast(message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      if (err.response?.status === 401) {
        showToast("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        showToast(err.response?.data?.message || "Failed to delete account. Please try again.");
      }
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "account", label: "Account", icon: Lock },
  ];

  return (
    <motion.div
      className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-2">
            <Settings2 size={24} />
            Settings
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800 rounded-xl p-2 flex flex-wrap gap-2 mt-4"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-sky-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{tab.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Profile Settings Tab */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-800 rounded-xl p-6 space-y-6 mt-4 shadow-md"
        >
          <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <User size={20} />
            <span>Profile Information</span>
          </h2>

          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="w-24 h-24 rounded-full border-2 border-transparent bg-gradient-to-r from-sky-500 to-purple-500 p-0.5"
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6 text-sky-400" />
                  </div>
                )}
              </motion.div>
              <label className="cursor-pointer absolute -bottom-2 -right-2 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full transition-all duration-300">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-50">{profileData.name || "N/A"}</h3>
              <p className="text-slate-400 text-sm">{profileData.email || "N/A"}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                {profileData.role || "N/A"}
              </span>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                className="cursor-pointer w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300"
                placeholder="Enter your full name"
                aria-required="true"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                  className="cursor-pointer w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300"
                  placeholder="Enter your email"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 text-white rounded-xl transition-all duration-300 text-sm"
            >
              {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} />}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-800 rounded-xl p-6 space-y-6 mt-4 shadow-md"
        >
          <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <Shield size={20} />
            <span>Security Settings</span>
          </h2>

          {/* Change Password */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-50">Change Password</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="cursor-pointer w-full pl-10 pr-12 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300"
                  placeholder="Enter current password"
                  aria-required="true"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="cursor-pointer w-full pl-10 pr-12 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300"
                    placeholder="Enter new password"
                    aria-required="true"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="cursor-pointer absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="cursor-pointer w-full pl-10 pr-12 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300"
                    placeholder="Confirm new password"
                    aria-required="true"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="cursor-pointer absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-slate-400 space-y-1">
                {[
                  "At least 8 characters long",
                  "Contains uppercase and lowercase letters",
                  "Contains at least one number",
                  "Contains at least one special character",
                ].map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check size={12} className="text-green-400" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Save Password Button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSavePassword}
                disabled={isSaving}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-400 text-white rounded-xl transition-all duration-300 text-sm"
              >
                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Lock size={18} />}
                <span>{isSaving ? "Updating..." : "Update Password"}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-800 rounded-xl p-6 space-y-6 mt-4 shadow-md"
        >
          <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <Lock size={20} />
            <span>Account Settings</span>
          </h2>

          {/* Account Information */}
          <div className="space-y-6">
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
              <h3 className="text-lg font-medium text-slate-50 mb-3">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Account Created:</span>
                  <p className="text-slate-200">
                    {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Last Login:</span>
                  <p className="text-slate-200">
                    {profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Account Status:</span>
                  <span className="inline-block ml-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    Active
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Two-Factor Auth:</span>
                  <span className="inline-block ml-2 px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                    Disabled
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-lg font-medium text-red-400 mb-3">Danger Zone</h3>
              <p className="text-slate-400 text-sm mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>
              <div className="space-y-3 sm:flex sm:space-y-0 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2"
                  disabled={isSaving}
                >
                  <Settings2 size={16} />
                  <span>Reset All Settings</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isSaving}
                  className="cursor-pointer w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="delete-confirmation-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-xl p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide shadow-lg"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="delete-confirmation-title" className="text-lg font-bold text-slate-50">
                  Confirm Account Deletion
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </motion.button>
              </div>
              <div className="space-y-3">
                <p className="text-slate-100 text-sm">
                  Are you sure you want to delete your account? This action is irreversible.
                </p>
                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="cursor-pointer px-4 py-2 bg-slate-600 text-slate-100 rounded-xl hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteAccount}
                    className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="animate-spin h-4 w-4" />}
                    Confirm
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;