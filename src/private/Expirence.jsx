import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Building2,
  Calendar,
  Code,
  Briefcase,
  Users,
  Clock,
  CheckSquare,
  Square,
  X,
  Loader2,
  Download,
} from "lucide-react";
import axios from "axios";
import { useToast } from "ai-toast";

const ExperiencePage = () => {
  const { showToast } = useToast();
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    companyName: "",
    role: "",
    duration: "",
    description: "",
    technologies: "",
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    companyName: "",
    role: "",
    duration: "",
    description: "",
    technologies: "",
  });
  const modalRef = useRef(null);

  // Focus trap for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && (showAddModal || showEditModal || showViewModal || showDeleteModal)) {
        setShowAddModal(false);
        setShowEditModal(null);
        setShowViewModal(null);
        setShowDeleteModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal, showEditModal, showViewModal, showDeleteModal]);

  // Fetch experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("No authentication token found");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}experiences/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExperiences(response.data.data || []);
        setFilteredExperiences(response.data.data || []);
      } catch (err) {
        showToast(err.message || "Failed to fetch experiences");
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  // Filter experiences
  useEffect(() => {
    const filtered = experiences.filter((experience) => {
      const matchesSearch =
        experience.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCompany = selectedCompany === "all" || experience.companyName === selectedCompany;
      const matchesRole = selectedRole === "all" || experience.role === selectedRole;
      return matchesSearch && matchesCompany && matchesRole;
    });
    setFilteredExperiences(filtered);
  }, [experiences, searchTerm, selectedCompany, selectedRole]);

  const companies = ["all", ...new Set(experiences.map((exp) => exp.companyName))];
  const roles = ["all", ...new Set(experiences.map((exp) => exp.role))];

  const handleSelectAll = () => {
    setSelectedExperiences(
      selectedExperiences.length === filteredExperiences.length
        ? []
        : filteredExperiences.map((exp) => exp._id)
    );
  };

  const handleSelectExperience = (experienceId) => {
    setSelectedExperiences((prev) =>
      prev.includes(experienceId) ? prev.filter((id) => id !== experienceId) : [...prev, experienceId]
    );
  };

  // Handle Bulk Actions
  const handleBulkAction = async (action) => {
    if (action === "delete") {
      setShowDeleteModal({ action, experienceId: null, isBulk: true });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (action === "export") {
        const exportData = experiences
          .filter((exp) => selectedExperiences.includes(exp._id))
          .map(({ companyName, role, duration, description, technologies, createdAt }) => ({
            companyName,
            role,
            duration,
            description,
            technologies,
            createdAt,
          }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "experiences_export.json";
        link.click();
        URL.revokeObjectURL(url);
        showToast("Selected experiences exported successfully");
      }
      setSelectedExperiences([]);
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action} experiences`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedExperiences.map((expId) =>
          axios.delete(`${import.meta.env.VITE_APP_BASE_URL}experiences/delete/${expId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      showToast("Selected experiences deleted successfully");
      setExperiences((prev) => prev.filter((exp) => !selectedExperiences.includes(exp._id)));
      setSelectedExperiences([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete experiences");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add Experience
  const handleAddExperience = async () => {
    if (!addFormData.companyName || !addFormData.role || !addFormData.description) {
      showToast("Company name, role, and description are required");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}experiences/create`,
        {
          ...addFormData,
          technologies: addFormData.technologies ? addFormData.technologies.split(",").map((t) => t.trim()) : [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setExperiences((prev) => [...prev, data]);
        setShowAddModal(false);
        setAddFormData({ companyName: "", role: "", duration: "", description: "", technologies: "" });
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add experience");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Experience
  const handleEditExperience = async () => {
    if (!editFormData.companyName || !editFormData.role || !editFormData.description) {
      showToast("Company name, role, and description are required");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}experiences/update/${editFormData.id}`,
        {
          ...editFormData,
          technologies: editFormData.technologies ? editFormData.technologies.split(",").map((t) => t.trim()) : [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setExperiences((prev) => prev.map((exp) => (exp._id === editFormData.id ? data : exp)));
        setShowEditModal(null);
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update experience");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Experience
  const handleDeleteExperience = async (experienceId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}experiences/delete/${experienceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, message } = response.data;
      if (success) {
        showToast(message);
        setExperiences((prev) => prev.filter((exp) => exp._id !== experienceId));
        setSelectedExperiences((prev) => prev.filter((id) => id !== experienceId));
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete experience");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Form Changes
  const handleAddFormChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Open Edit Modal
  const openEditModal = (experience) => {
    setEditFormData({
      id: experience._id,
      companyName: experience.companyName,
      role: experience.role,
      duration: experience.duration,
      description: experience.description,
      technologies: experience.technologies.join(", "),
    });
    setShowEditModal(experience._id);
  };

  // Open View Modal
  const openViewModal = (experience) => {
    setShowViewModal(experience);
  };

  // Open Delete Modal
  const openDeleteModal = (experienceId = null, isBulk = false) => {
    setShowDeleteModal({ experienceId, isBulk });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-slate-900"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
      >
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="text-sky-500" size={24} />
            Experience Management
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">Manage your professional work experience and career history</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="cursor-pointer bg-gradient-to-r from-sky-500 to-sky-600 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
        >
          <Plus size={18} />
          Add Experience
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4"
      >
        {[
          {
            title: "Total Experience",
            value: experiences.length,
            icon: Briefcase,
            color: "sky",
            change: `+${experiences.filter((exp) => new Date(exp.createdAt).getFullYear() === new Date().getFullYear()).length} this year`,
          },
          {
            title: "Companies",
            value: new Set(experiences.map((exp) => exp.companyName)).size,
            icon: Building2,
            color: "purple",
            change: `+${experiences.filter((exp) => {
              const expDate = new Date(exp.createdAt);
              const currentDate = new Date();
              return expDate.getMonth() === currentDate.getMonth() && expDate.getFullYear() === currentDate.getFullYear();
            }).length} this month`,
          },
          {
            title: "Total Years",
            value: experiences.reduce((sum, exp) => {
              const [start, end] = exp.duration.split(" - ");
              const startYear = parseInt(start);
              const endYear = end === "Present" ? new Date().getFullYear() : parseInt(end);
              return sum + (endYear - startYear);
            }, 0) || "0+",
            icon: Calendar,
            color: "emerald",
            change: "Growing",
          },
          {
            title: "Technologies",
            value: new Set(experiences.flatMap((exp) => exp.technologies)).size,
            icon: Code,
            color: "orange",
            change: `+${experiences.flatMap((exp) => exp.technologies).filter((_, i, arr) => arr.indexOf(_) === i && experiences.some((exp) => new Date(exp.createdAt).getFullYear() === new Date().getFullYear())).length} this year`,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-all duration-300"
            onClick={() => showToast(`${stat.title}: ${stat.value}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">{stat.title}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-100 mt-1">{stat.value}</p>
                <p className={`text-xs text-${stat.color}-400 mt-1`}>{stat.change}</p>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                <stat.icon className={`text-${stat.color}-400`} size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 mb-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search experiences, companies, or technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            {companies.map((company) => (
              <option key={company} value={company} className="bg-slate-800">
                {company === "all" ? "All Companies" : company}
              </option>
            ))}
          </select>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            {roles.map((role) => (
              <option key={role} value={role} className="bg-slate-800">
                {role === "all" ? "All Roles" : role}
              </option>
            ))}
          </select>
          {selectedExperiences.length > 0 && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openDeleteModal(null, true)}
                disabled={loading}
                className="cursor-pointer px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 text-sm disabled:opacity-50"
              >
                <Trash2 size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBulkAction("export")}
                disabled={loading}
                className="cursor-pointer px-3 py-2 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/30 text-sm disabled:opacity-50"
              >
                <Download size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Experiences List */}
      {loading ? (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto text-sky-500 animate-spin" size={40} />
          <p className="text-slate-400 mt-3 text-sm">Loading experiences...</p>
        </div>
      ) : filteredExperiences.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
          <Briefcase className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-base">No experiences found</p>
          <p className="text-slate-500 text-xs mt-1">Try adjusting your search or add a new experience</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden sm:block bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-3 text-left">
                    <button onClick={handleSelectAll} className="cursor-pointer text-slate-400 hover:text-slate-300">
                      {selectedExperiences.length === filteredExperiences.length && filteredExperiences.length > 0 ? (
                        <CheckSquare size={16} className="text-sky-500" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Company & Role</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Duration</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Technologies</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Description</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <AnimatePresence>
                  {filteredExperiences.map((experience, index) => (
                    <motion.tr
                      key={experience._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-3">
                        <button
                          onClick={() => handleSelectExperience(experience._id)}
                          className="cursor-pointer text-slate-400 hover:text-slate-300"
                        >
                          {selectedExperiences.includes(experience._id) ? (
                            <CheckSquare size={16} className="text-sky-500" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-slate-100 flex items-center gap-2 text-sm">
                            <Building2 size={14} className="text-sky-500" />
                            {experience.companyName}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <Users size={12} />
                            {experience.role}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                          <Clock size={14} className="text-purple-500" />
                          {experience.duration}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {experience.technologies.slice(0, 3).map((tech, techIndex) => (
                            <span key={techIndex} className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded-full">
                              {tech}
                            </span>
                          ))}
                          {experience.technologies.length > 3 && (
                            <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                              +{experience.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-slate-300 text-xs line-clamp-2 max-w-xs">{experience.description}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openViewModal(experience)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(experience)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Edit3 size={14} />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(experience._id)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
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
              {filteredExperiences.map((experience, index) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSelectExperience(experience._id)}
                        className="cursor-pointer text-slate-400 hover:text-slate-300"
                      >
                        {selectedExperiences.includes(experience._id) ? (
                          <CheckSquare size={16} className="text-sky-500" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                      <div>
                        <div className="font-medium text-slate-100 flex items-center gap-2 text-sm">
                          <Building2 size={14} className="text-sky-500" />
                          {experience.companyName}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <Users size={12} />
                          {experience.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openViewModal(experience)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Eye size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(experience)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(experience._id)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-2 text-slate-400 text-xs flex items-center gap-2">
                    <Clock size={12} className="text-purple-500" />
                    {experience.duration}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {experience.technologies.slice(0, 3).map((tech, techIndex) => (
                      <span key={techIndex} className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded-full">
                        {tech}
                      </span>
                    ))}
                    {experience.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                        +{experience.technologies.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-slate-300 text-xs line-clamp-2">{experience.description}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Add Experience Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="add-experience-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="add-experience-title" className="text-lg font-bold text-slate-100">Add New Experience</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={addFormData.companyName}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter company name"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={addFormData.role}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter role"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={addFormData.duration}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., 2020 - Present"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={addFormData.description}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter description"
                    rows={3}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    name="technologies"
                    value={addFormData.technologies}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="cursor-pointer px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Add Experience
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Experience Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="edit-experience-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="edit-experience-title" className="text-lg font-bold text-slate-100">Edit Experience</h2>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={editFormData.companyName}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter company name"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter role"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={editFormData.duration}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., 2020 - Present"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter description"
                    rows={3}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    name="technologies"
                    value={editFormData.technologies}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditExperience}
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

      {/* View Experience Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="view-experience-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="view-experience-title" className="text-lg font-bold text-slate-100">Experience Details</h2>
                <button
                  onClick={() => setShowViewModal(null)}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-100 font-medium text-base flex items-center gap-2">
                    <Building2 size={14} className="text-sky-500" />
                    {showViewModal.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Role</p>
                  <p className="text-slate-100 text-sm flex items-center gap-2">
                    <Users size={12} />
                    {showViewModal.role}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Duration</p>
                  <p className="text-slate-100 text-sm flex items-center gap-2">
                    <Clock size={12} className="text-purple-500" />
                    {showViewModal.duration}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Description</p>
                  <p className="text-slate-100 text-sm">{showViewModal.description}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Technologies</p>
                  <div className="flex flex-wrap gap-1">
                    {showViewModal.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowViewModal(null)}
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
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
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
                    ? `Are you sure you want to delete ${selectedExperiences.length} experience(s)?`
                    : "Are you sure you want to delete this experience?"}
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
                    onClick={() => showDeleteModal.isBulk ? handleBulkDelete() : handleDeleteExperience(showDeleteModal.experienceId)}
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
    </motion.div>
  );
};

export default ExperiencePage;