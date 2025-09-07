import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Search,
  Trash2,
  Archive,
  ExternalLink,
  Github,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  Eye,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useToast } from 'ai-toast';

const ProjectsPage = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    githubLink: "",
    liveLink: "",
    status: "active",
    images: [],
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    description: "",
    techStack: "",
    githubLink: "",
    liveLink: "",
    status: "active",
    images: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
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
        setPreviewImages([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal, showEditModal, showViewModal, showDeleteModal]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("No authentication token found");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}project/get-all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.data || []);
        setFilteredProjects(response.data.data || []);
      } catch (err) {
        showToast(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter projects
  useEffect(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.techStack.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedStatus]);

  const handleSelectProject = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProjects(selectedProjects.length === filteredProjects.length ? [] : filteredProjects.map((p) => p._id));
  };

  // Handle Bulk Actions
  const handleBulkAction = async (action) => {
    if (action === "delete") {
      setShowDeleteModal({ action, projectId: null, isBulk: true });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (action === "archive") {
        await Promise.all(
          selectedProjects.map((projectId) =>
            axios.patch(
              `${import.meta.env.VITE_APP_BASE_URL}project/update/${projectId}`,
              { status: "archived" },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        );
        showToast("Selected projects archived successfully");
        setProjects((prev) =>
          prev.map((project) =>
            selectedProjects.includes(project._id) ? { ...project, status: "archived" } : project
          )
        );
      } else if (action === "export") {
        const exportData = projects
          .filter((p) => selectedProjects.includes(p._id))
          .map(({ title, description, techStack, githubLink, liveLink, status, createdAt }) => ({
            title,
            description,
            techStack,
            githubLink,
            liveLink,
            status,
            createdAt,
          }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "projects_export.json";
        link.click();
        URL.revokeObjectURL(url);
        showToast("Selected projects exported successfully");
      }
      setSelectedProjects([]);
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action} projects`);
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
        selectedProjects.map((projectId) =>
          axios.delete(`${import.meta.env.VITE_APP_BASE_URL}project/delete/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      showToast("Selected projects deleted successfully");
      setProjects((prev) => prev.filter((project) => !selectedProjects.includes(project._id)));
      setSelectedProjects([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete projects");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add Project
  const handleAddProject = async () => {
    if (!addFormData.title || !addFormData.description) {
      showToast("Title and description are required");
      return;
    }
    if (addFormData.githubLink && !/^https?:\/\/(www\.)?github\.com\/.+$/.test(addFormData.githubLink)) {
      showToast("Please enter a valid GitHub URL");
      return;
    }
    if (addFormData.liveLink && !/^https?:\/\/.+$/.test(addFormData.liveLink)) {
      showToast("Please enter a valid live URL");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", addFormData.title);
      formDataToSend.append("description", addFormData.description);
      formDataToSend.append("techStack", addFormData.techStack);
      formDataToSend.append("githubLink", addFormData.githubLink);
      formDataToSend.append("liveLink", addFormData.liveLink);
      formDataToSend.append("status", addFormData.status);
      addFormData.images.forEach((image) => formDataToSend.append("images", image));

      const token = localStorage.getItem("token");
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}project/create`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setProjects((prev) => [...prev, data]);
        setShowAddModal(false);
        setAddFormData({
          title: "",
          description: "",
          techStack: "",
          githubLink: "",
          liveLink: "",
          status: "active",
          images: [],
        });
        setPreviewImages([]);
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Project
  const handleEditProject = async () => {
    if (!editFormData.title || !editFormData.description) {
      showToast("Title and description are required");
      return;
    }
    if (editFormData.githubLink && !/^https?:\/\/(www\.)?github\.com\/.+$/.test(editFormData.githubLink)) {
      showToast("Please enter a valid GitHub URL");
      return;
    }
    if (editFormData.liveLink && !/^https?:\/\/.+$/.test(editFormData.liveLink)) {
      showToast("Please enter a valid live URL");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", editFormData.title);
      formDataToSend.append("description", editFormData.description);
      formDataToSend.append("techStack", editFormData.techStack);
      formDataToSend.append("githubLink", editFormData.githubLink);
      formDataToSend.append("liveLink", editFormData.liveLink);
      formDataToSend.append("status", editFormData.status);
      editFormData.images.forEach((image) => formDataToSend.append("images", image));

      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_APP_BASE_URL}project/update/${editFormData.id}`,
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
        setProjects((prev) =>
          prev.map((project) => (project._id === editFormData.id ? data : project))
        );
        setShowEditModal(null);
        setPreviewImages([]);
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}project/delete/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, message } = response.data;
      if (success) {
        showToast(message);
        setProjects((prev) => prev.filter((project) => project._id !== projectId));
        setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete project");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add Form Change
  const handleAddFormChange = (e) => {
    if (e.target.name === "images") {
      const files = Array.from(e.target.files);
      if (files.some((file) => !file.type.startsWith("image/"))) {
        showToast("Please upload image files only");
        return;
      }
      if (files.length + addFormData.images.length > 5) {
        showToast("Maximum 5 images allowed");
        return;
      }
      setAddFormData({ ...addFormData, images: [...addFormData.images, ...files] });
      setPreviewImages([...previewImages, ...files.map((file) => URL.createObjectURL(file))]);
    } else {
      setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
    }
  };

  // Handle Edit Form Change
  const handleEditFormChange = (e) => {
    if (e.target.name === "images") {
      const files = Array.from(e.target.files);
      if (files.some((file) => !file.type.startsWith("image/"))) {
        showToast("Please upload image files only");
        return;
      }
      if (files.length + editFormData.images.length > 5) {
        showToast("Maximum 5 images allowed");
        return;
      }
      setEditFormData({ ...editFormData, images: [...editFormData.images, ...files] });
      setPreviewImages([...previewImages, ...files.map((file) => URL.createObjectURL(file))]);
    } else {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    }
  };

  // Open Edit Modal
  const openEditModal = (project) => {
    setEditFormData({
      id: project._id,
      title: project.title,
      description: project.description,
      techStack: project.techStack.join(", "),
      githubLink: project.githubLink,
      liveLink: project.liveLink,
      status: project.status,
      images: [],
    });
    setPreviewImages(project.images.map((img) => `${img}`));
    setShowEditModal(project._id);
  };

  // Open View Modal
  const openViewModal = (project) => {
    setShowViewModal(project);
    setPreviewImages(project.images.map((img) => `${img}`));
  };

  // Open Delete Modal
  const openDeleteModal = (projectId = null, isBulk = false) => {
    setShowDeleteModal({ projectId, isBulk });
  };

  // Trigger file input click
  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "archived":
        return <Archive className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "archived":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
            <FolderOpen className="text-sky-400" size={24} />
            Projects
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Manage your portfolio projects and showcase your work
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="cursor-pointer bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
        >
          <Plus size={18} />
          Add Project
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
          { title: "Total Projects", value: projects.length, icon: FolderOpen, color: "sky" },
          { title: "Active Projects", value: projects.filter((p) => p.status === "active").length, icon: CheckCircle, color: "green" },
          { title: "Archived Projects", value: projects.filter((p) => p.status === "archived").length, icon: Archive, color: "orange" },
          {
            title: "This Month",
            value: projects.filter((p) => {
              const projectDate = new Date(p.createdAt);
              const currentDate = new Date();
              return projectDate.getMonth() === currentDate.getMonth() && projectDate.getFullYear() === currentDate.getFullYear();
            }).length,
            icon: Calendar,
            color: "purple",
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
              <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
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
              placeholder="Search projects by title, description, or tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          {selectedProjects.length > 0 && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBulkAction("archive")}
                disabled={loading}
                className="cursor-pointer px-3 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 text-sm disabled:opacity-50"
              >
                <Archive size={16} />
              </motion.button>
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

      {/* Projects List */}
      {loading ? (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto text-sky-500 animate-spin" size={40} />
          <p className="text-slate-400 mt-3 text-sm">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
          <FolderOpen className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-base">No projects found</p>
          <p className="text-slate-500 text-xs mt-1">Try adjusting your search or add a new project</p>
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
                      checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Project</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Tech Stack</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Status</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Links</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Created</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.tr
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project._id)}
                          onChange={() => handleSelectProject(project._id)}
                          className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="text-sm font-medium text-slate-100">{project.title}</div>
                          <div className="text-xs text-slate-400 mt-1 max-w-xs truncate">{project.description}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          {project.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer p-1 text-slate-400 hover:text-slate-100 transition-colors"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {project.liveLink && (
                            <a
                              href={project.liveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer p-1 text-slate-400 hover:text-slate-100 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-slate-400">{formatDate(project.createdAt)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openViewModal(project)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(project)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Edit3 size={14} />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(project._id)}
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
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
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
                        checked={selectedProjects.includes(project._id)}
                        onChange={() => handleSelectProject(project._id)}
                        className="cursor-pointer w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                      />
                      <div>
                        <p className="text-slate-100 font-medium text-sm">{project.title}</p>
                        <p className="text-slate-400 text-xs truncate max-w-[200px]">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openViewModal(project)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Eye size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(project)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(project._id)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-2 text-slate-400 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(project.createdAt)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {project.techStack.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </span>
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer p-1 text-slate-400 hover:text-slate-100 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer p-1 text-slate-400 hover:text-slate-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="add-project-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="add-project-title" className="text-lg font-bold text-slate-100">Add New Project</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setPreviewImages([]);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={addFormData.title}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter project title"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={addFormData.description}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter project description"
                    rows={3}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    name="techStack"
                    value={addFormData.techStack}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">GitHub Link (Optional)</label>
                  <input
                    type="url"
                    name="githubLink"
                    value={addFormData.githubLink}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter GitHub URL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Live Link (Optional)</label>
                  <input
                    type="url"
                    name="liveLink"
                    value={addFormData.liveLink}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter live URL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Status</label>
                  <select
                    name="status"
                    value={addFormData.status}
                    onChange={handleAddFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Images (Max 5, Optional)</label>
                  <div
                    onClick={() => triggerFileInput(addFileInputRef)}
                    className="cursor-pointer w-full h-24 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:border-sky-500 transition-all duration-300"
                  >
                    {previewImages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {previewImages.map((img, i) => (
                          <img key={i} src={img} alt={`Preview ${i}`} className="w-12 h-12 rounded-md object-cover" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={18} />
                        <span className="text-sm">Upload Images</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
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
                      setPreviewImages([]);
                    }}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="cursor-pointer px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Add Project
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="edit-project-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="edit-project-title" className="text-lg font-bold text-slate-100">Edit Project</h2>
                <button
                  onClick={() => {
                    setShowEditModal(null);
                    setPreviewImages([]);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter project title"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter project description"
                    rows={3}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    name="techStack"
                    value={editFormData.techStack}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">GitHub Link (Optional)</label>
                  <input
                    type="url"
                    name="githubLink"
                    value={editFormData.githubLink}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter GitHub URL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Live Link (Optional)</label>
                  <input
                    type="url"
                    name="liveLink"
                    value={editFormData.liveLink}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter live URL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Images (Max 5, Optional)</label>
                  <div
                    onClick={() => triggerFileInput(editFileInputRef)}
                    className="cursor-pointer w-full h-24 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:border-sky-500 transition-all duration-300"
                  >
                    {previewImages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {previewImages.map((img, i) => (
                          <img key={i} src={img} alt={`Preview ${i}`} className="w-12 h-12 rounded-md object-cover" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={18} />
                        <span className="text-sm">Upload Images</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
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
                      setPreviewImages([]);
                    }}
                    className="cursor-pointer px-3 py-2 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditProject}
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

      {/* View Project Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="view-project-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="view-project-title" className="text-lg font-bold text-slate-100">Project Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(null);
                    setPreviewImages([]);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-100 font-medium text-base">{showViewModal.title}</p>
                  <p className="text-slate-400 text-xs">{showViewModal.description}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {showViewModal.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(showViewModal.status)}`}>
                    {getStatusIcon(showViewModal.status)}
                    {showViewModal.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Links</p>
                  <div className="flex items-center gap-2">
                    {showViewModal.githubLink && (
                      <a
                        href={showViewModal.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-slate-400 hover:text-slate-100 text-xs flex items-center gap-1"
                      >
                        <Github size={14} />
                        GitHub
                      </a>
                    )}
                    {showViewModal.liveLink && (
                      <a
                        href={showViewModal.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-slate-400 hover:text-slate-100 text-xs flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        Live
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Created</p>
                  <p className="text-slate-100 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(showViewModal.createdAt)}
                  </p>
                </div>
                {showViewModal.images.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs">Images</p>
                    <div className="flex flex-wrap gap-2">
                      {showViewModal.images.map((img, i) => (
                        <img
                          key={i}
                          src={`${img}`}
                          alt={`Project image ${i}`}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowViewModal(null);
                      setPreviewImages([]);
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
                    ? `Are you sure you want to delete ${selectedProjects.length} project(s)?`
                    : "Are you sure you want to delete this project?"}
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
                    onClick={() => showDeleteModal.isBulk ? handleBulkDelete() : handleDeleteProject(showDeleteModal.projectId)}
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

export default ProjectsPage;