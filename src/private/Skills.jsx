import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Code,
  Database,
  TestTube,
  Star,
  TrendingUp,
  Award,
  X,
  Upload,
  Loader2,
  Download,
} from "lucide-react";
import axios from "axios";
import { useToast } from 'ai-toast';

const SkillsPage = () => {
  const { showToast } = useToast();
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: "", level: "beginner", category: "frontend", icon: null });
  const [editFormData, setEditFormData] = useState({ id: "", name: "", level: "beginner", category: "frontend", icon: null });
  const [previewIcon, setPreviewIcon] = useState(null);
  const modalRef = useRef(null);
  const addFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Focus trap for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && (showAddModal || showEditModal || showViewModal || showDeleteModal)) {
        setShowAddModal(false);
        setShowEditModal(null);
        setShowViewModal(null);
        setShowDeleteModal(null);
        setPreviewIcon(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal, showEditModal, showViewModal, showDeleteModal]);

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("No authentication token found");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}skill/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSkills(response.data.data || []);
        setFilteredSkills(response.data.data || []);
      } catch (err) {
        showToast(err.message || "Failed to fetch skills");
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // Filter skills
  useEffect(() => {
    const filtered = skills.filter((skill) => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
      const matchesLevel = selectedLevel === "all" || skill.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
    setFilteredSkills(filtered);
  }, [skills, searchTerm, selectedCategory, selectedLevel]);

  const handleSelectAll = () => {
    setSelectedSkills(selectedSkills.length === filteredSkills.length ? [] : filteredSkills.map((skill) => skill._id));
  };

  const handleSelectSkill = (skillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  // Handle Bulk Actions
  const handleBulkAction = async (action) => {
    if (action === "delete") {
      setShowDeleteModal({ action, skillId: null, isBulk: true });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (action === "export") {
        const exportData = skills
          .filter((s) => selectedSkills.includes(s._id))
          .map(({ name, level, category, createdAt }) => ({ name, level, category, createdAt }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "skills_export.json";
        link.click();
        URL.revokeObjectURL(url);
        showToast("Selected skills exported successfully");
      }
      setSelectedSkills([]);
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action} skills`);
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
        selectedSkills.map((skillId) =>
          axios.delete(`${import.meta.env.VITE_APP_BASE_URL}skill/delete/${skillId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      showToast("Selected skills deleted successfully");
      setSkills((prev) => prev.filter((skill) => !selectedSkills.includes(skill._id)));
      setSelectedSkills([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete skills");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add Skill
  const handleAddSkill = async () => {
    if (!addFormData.name) {
      showToast("Skill name is required");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", addFormData.name);
      formDataToSend.append("level", addFormData.level);
      formDataToSend.append("category", addFormData.category);
      if (addFormData.icon) formDataToSend.append("icon", addFormData.icon);

      const token = localStorage.getItem("token");
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}skill/create`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setSkills((prev) => [...prev, data]);
        setShowAddModal(false);
        setAddFormData({ name: "", level: "beginner", category: "frontend", icon: null });
        setPreviewIcon(null);
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add skill");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Skill
  const handleEditSkill = async () => {
    if (!editFormData.name) {
      showToast("Skill name is required");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", editFormData.name);
      formDataToSend.append("level", editFormData.level);
      formDataToSend.append("category", editFormData.category);
      if (editFormData.icon) formDataToSend.append("icon", editFormData.icon);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}skill/update/${editFormData.id}`,
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
        showToast(message);
        setSkills((prev) => prev.map((skill) => (skill._id === editFormData.id ? data : skill)));
        setShowEditModal(null);
        setPreviewIcon(null);
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update skill");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Skill
  const handleDeleteSkill = async (skillId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}skill/delete/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, message } = response.data;
      if (success) {
        showToast(message);
        setSkills((prev) => prev.filter((skill) => skill._id !== skillId));
        setSelectedSkills((prev) => prev.filter((id) => id !== skillId));
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete skill");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add Form Change
  const handleAddFormChange = (e) => {
    if (e.target.name === "icon") {
      const file = e.target.files[0];
      if (file && !file.type.startsWith("image/")) {
        showToast("Please upload an image file");
        return;
      }
      setAddFormData({ ...addFormData, icon: file });
      setPreviewIcon(file ? URL.createObjectURL(file) : null);
    } else {
      setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
    }
  };

  // Handle Edit Form Change
  const handleEditFormChange = (e) => {
    if (e.target.name === "icon") {
      const file = e.target.files[0];
      if (file && !file.type.startsWith("image/")) {
        showToast("Please upload an image file");
        return;
      }
      setEditFormData({ ...editFormData, icon: file });
      setPreviewIcon(file ? URL.createObjectURL(file) : null);
    } else {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    }
  };

  // Open Edit Modal
  const openEditModal = (skill) => {
    setEditFormData({
      id: skill._id,
      name: skill.name,
      level: skill.level,
      category: skill.category,
      icon: null,
    });
    setPreviewIcon(skill.icon ? `${skill.icon}` : null);
    setShowEditModal(skill._id);
  };

  // Open View Modal
  const openViewModal = (skill) => {
    setShowViewModal(skill);
    setPreviewIcon(skill.icon ? `${skill.icon}` : null);
  };

  // Open Delete Modal
  const openDeleteModal = (skillId = null, isBulk = false) => {
    setShowDeleteModal({ skillId, isBulk });
  };

  // Trigger file input click
  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "qa", label: "QA/Testing" },
  ];

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case "beginner":
        return "bg-amber-400/10 text-amber-400 border-amber-400/20";
      case "intermediate":
        return "bg-sky-400/10 text-sky-400 border-sky-400/20";
      case "expert":
        return "bg-purple-400/10 text-purple-400 border-purple-400/20";
      default:
        return "bg-slate-400/10 text-slate-400 border-slate-400/20";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "frontend":
        return <Code className="w-4 h-4" />;
      case "backend":
        return <Database className="w-4 h-4" />;
      case "qa":
        return <TestTube className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
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
            <Award className="text-sky-400" size={24} />
            Skills Management
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">Manage your technical skills and expertise</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="cursor-pointer bg-gradient-to-r from-sky-500 to-purple-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
        >
          <Plus size={18} />
          Add Skill
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4"
      >
        {[
          { title: "Total Skills", value: skills.length, icon: Award, color: "sky" },
          { title: "Expert Level", value: skills.filter((s) => s.level === "expert").length, icon: Star, color: "purple" },
          { title: "Categories", value: new Set(skills.map((s) => s.category)).size, icon: Code, color: "green" },
          {
            title: "This Month",
            value: skills.filter((s) => {
              const skillDate = new Date(s.createdAt);
              const currentDate = new Date();
              return skillDate.getMonth() === currentDate.getMonth() && skillDate.getFullYear() === currentDate.getFullYear();
            }).length,
            icon: TrendingUp,
            color: "amber",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="cursor-pointer bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-all duration-300"
            onClick={() => showToast(`${stat.title}: ${stat.value}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">{stat.title}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-100 mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-400/10`}>
                <stat.icon className={`text-${stat.color}-400`} size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 mb-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value} className="bg-slate-800">
                {category.label}
              </option>
            ))}
          </select>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
          >
            {levels.map((level) => (
              <option key={level.value} value={level.value} className="bg-slate-800">
                {level.label}
              </option>
            ))}
          </select>
          {selectedSkills.length > 0 && (
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

      {/* Skills List */}
      {loading ? (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto text-sky-500 animate-spin" size={40} />
          <p className="text-slate-400 mt-3 text-sm">Loading skills...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
          <Award className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-base">No skills found</p>
          <p className="text-slate-500 text-xs mt-1">Try adjusting your search or add a new skill</p>
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
              <thead className="bg-slate-700/30 border-b border-slate-700/50">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSkills.length === filteredSkills.length && filteredSkills.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Skill</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Category</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Level</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Created</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <AnimatePresence>
                  {filteredSkills.map((skill, index) => (
                    <motion.tr
                      key={skill._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill._id)}
                          onChange={() => handleSelectSkill(skill._id)}
                          className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {skill.icon ? (
                            <img
                              src={`${skill.icon}`}
                              alt={skill.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <Code className="w-6 h-6 text-slate-400" />
                          )}
                          <span className="text-sm font-medium text-slate-100">{skill.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(skill.category)}
                          <span className="text-sm text-slate-300 capitalize">{skill.category}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-400">
                        {new Date(skill.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openViewModal(skill)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(skill)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Edit3 size={14} />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(skill._id)}
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
              {filteredSkills.map((skill, index) => (
                <motion.div
                  key={skill._id}
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
                        checked={selectedSkills.includes(skill._id)}
                        onChange={() => handleSelectSkill(skill._id)}
                        className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          {skill.icon ? (
                            <img
                              src={`${skill.icon}`}
                              alt={skill.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <Code className="w-5 h-5 text-slate-400" />
                          )}
                          <p className="text-slate-100 font-medium text-sm">{skill.name}</p>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 capitalize">{skill.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openViewModal(skill)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Eye size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(skill)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(skill._id)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-2 text-slate-400 text-xs">
                    Created: {new Date(skill.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(skill.level)}`}>
                      {skill.level}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="add-skill-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="add-skill-title" className="text-lg font-bold text-slate-100">Add New Skill</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setPreviewIcon(null);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={addFormData.name}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter skill name"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Level</label>
                  <select
                    name="level"
                    value={addFormData.level}
                    onChange={handleAddFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Category</label>
                  <select
                    name="category"
                    value={addFormData.category}
                    onChange={handleAddFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="qa">QA/Testing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Icon (Optional)</label>
                  <div
                    onClick={() => triggerFileInput(addFileInputRef)}
                    className="cursor-pointer w-full h-24 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:border-sky-500 transition-all duration-300"
                  >
                    {previewIcon ? (
                      <img src={previewIcon} alt="Icon preview" className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={18} />
                        <span className="text-sm">Upload Icon</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="icon"
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
                      setPreviewIcon(null);
                    }}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="cursor-pointer px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Add Skill
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Skill Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="edit-skill-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="edit-skill-title" className="text-lg font-bold text-slate-100">Edit Skill</h2>
                <button
                  onClick={() => {
                    setShowEditModal(null);
                    setPreviewIcon(null);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter skill name"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Level</label>
                  <select
                    name="level"
                    value={editFormData.level}
                    onChange={handleEditFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="qa">QA/Testing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Icon (Optional)</label>
                  <div
                    onClick={() => triggerFileInput(editFileInputRef)}
                    className="cursor-pointer w-full h-24 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:border-sky-500 transition-all duration-300"
                  >
                    {previewIcon ? (
                      <img src={previewIcon} alt="Icon preview" className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={18} />
                        <span className="text-sm">Upload Icon</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="icon"
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
                      setPreviewIcon(null);
                    }}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditSkill}
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

      {/* View Skill Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="view-skill-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="view-skill-title" className="text-lg font-bold text-slate-100">Skill Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(null);
                    setPreviewIcon(null);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-100 font-medium text-base">{showViewModal.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Category</p>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(showViewModal.category)}
                    <p className="text-slate-100 text-sm capitalize">{showViewModal.category}</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Level</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(showViewModal.level)}`}>
                    {showViewModal.level}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Created</p>
                  <p className="text-slate-100 text-sm">
                    {new Date(showViewModal.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {showViewModal.icon && (
                  <div>
                    <p className="text-slate-400 text-xs">Icon</p>
                    <img
                      src={`${showViewModal.icon}`}
                      alt="Skill icon"
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowViewModal(null);
                      setPreviewIcon(null);
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
                    ? `Are you sure you want to delete ${selectedSkills.length} skill(s)?`
                    : "Are you sure you want to delete this skill?"}
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
                    onClick={() => showDeleteModal.isBulk ? handleBulkDelete() : handleDeleteSkill(showDeleteModal.skillId)}
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

export default SkillsPage;