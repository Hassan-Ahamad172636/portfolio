import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Mail,
  Calendar,
  X,
  User,
  Upload,
  Lock,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useToast } from 'ai-toast';

const UsersPage = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    profilePicture: null,
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    email: "",
    profilePicture: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const modalRef = useRef(null);
  const addFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
    if (success) {
      showToast(success, 'success');
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Focus trap for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && (showAddModal || showEditModal || showViewModal || showDeleteModal)) {
        setShowAddModal(false);
        setShowEditModal(null);
        setShowViewModal(null);
        setShowDeleteModal(null);
        setPreviewImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal, showEditModal, showViewModal, showDeleteModal]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}user/get-all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedUsers = response.data?.data || [];
        const standardizedUsers = fetchedUsers.map((user) => ({
          ...user,
          id: user._id,
        }));
        setUsers(standardizedUsers);
      } catch (err) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      user.email?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      const newSelected = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      const newSelected = filteredUsers.map((user) => user.id);
      setSelectedUsers(newSelected);
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedUsers.map((userId) =>
          axios.delete(
            `${import.meta.env.VITE_APP_BASE_URL}user/delete/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setSuccess("Selected users deleted successfully");
      setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete users");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.email || !addFormData.password) {
      setError("All fields are required!");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (addFormData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", addFormData.name);
      formDataToSend.append("email", addFormData.email);
      formDataToSend.append("password", addFormData.password);
      if (addFormData.profilePicture) {
        formDataToSend.append("profilePicture", addFormData.profilePicture);
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}user/create`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        setSuccess(message);
        setUsers((prev) => [...prev, { ...data, id: data._id, createdAt: new Date() }]);
        setShowAddModal(false);
        setAddFormData({ name: "", email: "", password: "", profilePicture: null });
        setPreviewImage(null);
      } else {
        setError(message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit User
  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.email) {
      setError("All fields are required!");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", editFormData.name);
      formDataToSend.append("email", editFormData.email);
      if (editFormData.profilePicture) {
        formDataToSend.append("profilePicture", editFormData.profilePicture);
      }

      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_APP_BASE_URL}user/update/${editFormData.id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        setSuccess(message);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === editFormData.id ? { ...user, ...data, id: data._id } : user
          )
        );
        setShowEditModal(null);
        setPreviewImage(null);
      } else {
        setError(message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}user/delete/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { success, message } = response.data;
      if (success) {
        setSuccess(message);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setSelectedUsers((prev) => prev.filter((id) => id !== userId));
      } else {
        setError(message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add Form Change
  const handleAddFormChange = (e) => {
    if (e.target.name === "profilePicture") {
      const file = e.target.files[0];
      if (file && !file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      setAddFormData({ ...addFormData, profilePicture: file });
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else {
      setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
    }
  };

  // Handle Edit Form Change
  const handleEditFormChange = (e) => {
    if (e.target.name === "profilePicture") {
      const file = e.target.files[0];
      if (file && !file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      setEditFormData({ ...editFormData, profilePicture: file });
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setEditFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: null,
    });
    setPreviewImage(user.profilePicture ? `${user.profilePicture}` : null);
    setShowEditModal(user.id);
  };

  // Open View Modal
  const openViewModal = (user) => {
    setShowViewModal({ ...user, id: user.id });
    setPreviewImage(user.profilePicture ? `${user.profilePicture}` : null);
  };

  // Open Delete Modal
  const openDeleteModal = (userId = null, isBulk = false) => {
    setShowDeleteModal({ userId, isBulk });
  };

  // Trigger file input click
  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
      >
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-sky-400" size={24} />
            User Management
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Manage all users and their details
          </p>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openDeleteModal(null, true)}
              disabled={loading}
              className="cursor-pointer bg-red-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
            >
              <Trash2 size={18} />
              Delete Selected ({selectedUsers.length})
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="cursor-pointer bg-gradient-to-r from-sky-500 to-purple-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
          >
            <Plus size={18} />
            Add User
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4"
      >
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "sky" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
            onClick={() => showToast(`Total ${stat.label}: ${stat.value}`, 'info')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-100 mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`text-${stat.color}-400`} size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 mb-4"
      >
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-300"
          />
        </div>
      </motion.div>

      {/* Users List */}
      {loading ? (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto text-sky-500 animate-spin" size={40} />
          <p className="text-slate-400 mt-3 text-sm">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
          <Users className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-base">No users found</p>
          <p className="text-slate-500 text-xs mt-1">
            {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first user"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Desktop Table */}
          <div className="hidden sm:block bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                      aria-label="Select all users"
                    />
                  </th>
                  <th className="p-3 text-left text-slate-300 text-sm font-medium">User</th>
                  <th className="p-3 text-left text-slate-300 text-sm font-medium">Joined</th>
                  <th className="p-3 text-left text-slate-300 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                          aria-label={`Select ${user.name}`}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {user.profilePicture ? (
                            <img
                              src={`${user.profilePicture}`}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-slate-100 font-medium text-sm">{user.name}</p>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Calendar size={12} />
                          {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openViewModal(user)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                            aria-label={`View ${user.name}`}
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(user)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                            aria-label={`Edit ${user.name}`}
                          >
                            <Edit3 size={14} />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(user.id)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                            aria-label={`Delete ${user.name}`}
                          >
                            <Trash2 size={14} />
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="sm:hidden space-y-3">
            <AnimatePresence>
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                        aria-label={`Select ${user.name}`}
                      />
                      {user.profilePicture ? (
                        <img
                          src={`${user.profilePicture}`}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-slate-100 font-medium text-sm">{user.name}</p>
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <Mail size={12} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openViewModal(user)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                        aria-label={`View ${user.name}`}
                      >
                        <Eye size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(user)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                        aria-label={`Edit ${user.name}`}
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(user.id)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-2 text-slate-400 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="add-user-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-hidden"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="add-user-title" className="text-lg font-bold text-slate-100">Add New User</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setPreviewImage(null);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddFormChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Enter full name"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={addFormData.email}
                      onChange={handleAddFormChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Enter email"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      name="password"
                      value={addFormData.password}
                      onChange={handleAddFormChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Enter password (min 6 chars)"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Profile Picture (Optional)</label>
                  <div
                    onClick={() => triggerFileInput(addFileInputRef)}
                    className="cursor-pointer w-full h-24 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:border-sky-500 transition-all duration-300"
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={18} />
                        <span className="text-sm">Upload Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleAddFormChange}
                    className="hidden"
                    ref={addFileInputRef}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setPreviewImage(null);
                    }}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddUser}
                    className="cursor-pointer px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Add User
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="edit-user-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-hidden"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="edit-user-title" className="text-lg font-bold text-slate-100">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditModal(null);
                    setPreviewImage(null);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Enter full name"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Enter email"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Profile Picture (Optional)</label>
                  <div
                    onClick={() => triggerFileInput(editFileInputRef)}
                    className="cursor-pointer w-full h-24 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:border-sky-500 transition-all duration-300"
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={18} />
                        <span className="text-sm">Upload Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleEditFormChange}
                    className="hidden"
                    ref={editFileInputRef}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(null);
                      setPreviewImage(null);
                    }}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditUser}
                    className="cursor-pointer px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="view-user-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-hidden"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="view-user-title" className="text-lg font-bold text-slate-100">User Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(null);
                    setPreviewImage(null);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {showViewModal.profilePicture ? (
                    <img
                      src={`${showViewModal.profilePicture}`}
                      alt={showViewModal.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                      {showViewModal.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-slate-100 font-medium text-base">{showViewModal.name}</p>
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <Mail size={12} />
                      {showViewModal.email}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Joined</p>
                  <p className="text-slate-100 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(showViewModal.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowViewModal(null);
                      setPreviewImage(null);
                    }}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-hidden"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="delete-confirmation-title" className="text-lg font-bold text-slate-100">
                  Confirm Deletion
                </h2>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-slate-100 text-sm">
                  {showDeleteModal.isBulk
                    ? `Are you sure you want to delete ${selectedUsers.length} user(s)?`
                    : "Are you sure you want to delete this user?"}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(null)}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => showDeleteModal.isBulk ? handleBulkDelete() : handleDeleteUser(showDeleteModal.userId)}
                    className="cursor-pointer px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersPage;