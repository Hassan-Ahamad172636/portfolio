import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  FileText,
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  X,
  Upload,
} from "lucide-react";
import axios from "axios";
import { useToast } from "ai-toast";

export default function BlogsPage() {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    content: "",
    tags: "",
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

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("No authentication token found");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}blogs/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedBlogs = response.data.data || [];
        setBlogs(fetchedBlogs);
        setFilteredBlogs(fetchedBlogs);
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Filter blogs
  useEffect(() => {
    const filtered = blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.authorId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "published" ? blog.publishedAt : !blog.publishedAt);
      const matchesTag = selectedTag === "all" || blog.tags.includes(selectedTag);
      return matchesSearch && matchesStatus && matchesTag;
    });
    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, selectedStatus, selectedTag]);

  const allTags = [...new Set(blogs.flatMap((blog) => blog.tags))];

  const handleSelectAll = () => {
    setSelectedBlogs(
      selectedBlogs.length === filteredBlogs.length
        ? []
        : filteredBlogs.map((blog) => blog._id)
    );
  };

  const handleSelectBlog = (id) => {
    setSelectedBlogs((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Handle Bulk Actions
  const handleBulkAction = async (action) => {
    if (action === "delete") {
      setShowDeleteModal({ action, blogId: null, isBulk: true });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (action === "publish" || action === "draft") {
        await Promise.all(
          selectedBlogs.map((id) =>
            axios.put(
              `${import.meta.env.VITE_APP_BASE_URL}blogs/update/${id}`,
              { publishedAt: action === "publish" ? new Date() : null },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        );
        showToast(`Selected blogs ${action}ed successfully`);
        setBlogs((prev) =>
          prev.map((b) =>
            selectedBlogs.includes(b._id)
              ? { ...b, publishedAt: action === "publish" ? new Date() : null }
              : b
          )
        );
      } else if (action === "export") {
        const exportData = blogs
          .filter((b) => selectedBlogs.includes(b._id))
          .map(({ title, slug, content, tags, authorId, publishedAt, createdAt }) => ({
            title,
            slug,
            content,
            tags,
            author: authorId?.name,
            publishedAt,
            createdAt,
          }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "blogs_export.json";
        link.click();
        URL.revokeObjectURL(url);
        showToast("Selected blogs exported successfully");
      }
      setSelectedBlogs([]);
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action} blogs`);
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
        selectedBlogs.map((id) =>
          axios.delete(`${import.meta.env.VITE_APP_BASE_URL}blogs/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      showToast("Selected blogs deleted successfully");
      setBlogs((prev) => prev.filter((b) => !selectedBlogs.includes(b._id)));
      setSelectedBlogs([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete blogs");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add Blog
  const handleAddBlog = async () => {
    if (!addFormData.title || !addFormData.content) {
      showToast("Title and content are required");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}blogs/create`,
        {
          ...addFormData,
          tags: addFormData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setBlogs((prev) => [...prev, data]);
        setShowAddModal(false);
        setAddFormData({ title: "", content: "", tags: "" });
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add blog");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Blog
  const handleEditBlog = async () => {
    if (!editFormData.title || !editFormData.content) {
      showToast("Title and content are required");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}blogs/update/${editFormData.id}`,
        {
          ...editFormData,
          tags: editFormData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setBlogs((prev) => prev.map((b) => (b._id === editFormData.id ? data : b)));
        setShowEditModal(null);
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Blog
  const handleDeleteBlog = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}blogs/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { success, message } = response.data;
      if (success) {
        showToast(message);
        setBlogs((prev) => prev.filter((b) => b._id !== id));
        setSelectedBlogs((prev) => prev.filter((b) => b !== id));
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete blog");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Form Changes
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Edit Modal
  const openEditModal = (blog) => {
    setEditFormData({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags.join(", "),
    });
    setShowEditModal(blog._id);
  };

  // Open View Modal
  const openViewModal = (blog) => {
    setShowViewModal(blog);
  };

  // Open Delete Modal
  const openDeleteModal = (blogId = null, isBulk = false) => {
    setShowDeleteModal({ blogId, isBulk });
  };

  const getStatusColor = (publishedAt) => {
    return publishedAt
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  const getStatusIcon = (publishedAt) => {
    return publishedAt ? (
      <CheckCircle className="w-3 h-3" />
    ) : (
      <Clock className="w-3 h-3" />
    );
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
            <BookOpen className="text-sky-400" size={24} />
            Blog Management
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">Manage your blog posts and articles</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="cursor-pointer bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
        >
          <Plus size={18} />
          New Blog Post
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4"
      >
        {[
          {
            label: "Total Posts",
            value: blogs.length,
            icon: FileText,
            color: "sky",
            bgColor: "bg-sky-500/10",
            change: `+${blogs.filter((b) => new Date(b.createdAt).getFullYear() === new Date().getFullYear()).length} this year`,
          },
          {
            label: "Published",
            value: blogs.filter((b) => b.publishedAt).length,
            icon: CheckCircle,
            color: "green",
            bgColor: "bg-green-500/10",
            change: "Active",
          },
          {
            label: "Drafts",
            value: blogs.filter((b) => !b.publishedAt).length,
            icon: Clock,
            color: "yellow",
            bgColor: "bg-yellow-500/10",
            change: "In progress",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-all duration-300"
            onClick={() => showToast(`${stat.label}: ${stat.value}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-100 mt-1">{stat.value}</p>
                <p className={`text-xs text-${stat.color}-400 mt-1`}>{stat.change}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
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
              placeholder="Search by title, author, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all" className="bg-slate-800">All Status</option>
              <option value="published" className="bg-slate-800">Published</option>
              <option value="draft" className="bg-slate-800">Draft</option>
            </select>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all" className="bg-slate-800">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag} className="bg-slate-800">
                  {tag}
                </option>
              ))}
            </select>
          </div>
          {selectedBlogs.length > 0 && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBulkAction("publish")}
                disabled={loading}
                className="cursor-pointer px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 text-sm disabled:opacity-50"
              >
                <CheckCircle size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBulkAction("draft")}
                disabled={loading}
                className="cursor-pointer px-3 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 text-sm disabled:opacity-50"
              >
                <Clock size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
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
                <Upload size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Blogs List */}
      {loading ? (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto text-sky-500 animate-spin" size={40} />
          <p className="text-slate-400 mt-3 text-sm">Loading blogs...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
          <BookOpen className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-base">
            {searchTerm || selectedStatus !== "all" || selectedTag !== "all"
              ? "No blogs found"
              : "Create your first blog to get started"}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {searchTerm || selectedStatus !== "all" || selectedTag !== "all"
              ? "Try adjusting your search or filters"
              : "Add a new blog using the button above"}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden sm:block bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Title</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Author</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Tags</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Status</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Published</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <AnimatePresence>
                  {filteredBlogs.map((blog, index) => (
                    <motion.tr
                      key={blog._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedBlogs.includes(blog._id)}
                          onChange={() => handleSelectBlog(blog._id)}
                          className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <h3
                            className="cursor-pointer text-slate-100 font-medium hover:text-sky-400 transition-colors text-sm"
                            onClick={() => openViewModal(blog)}
                          >
                            {blog.title}
                          </h3>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 text-sm">{blog.authorId?.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md text-xs border border-purple-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 2 && (
                            <span className="px-2 py-1 bg-slate-600/50 text-slate-400 rounded-md text-xs">
                              +{blog.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${getStatusColor(blog.publishedAt)}`}
                        >
                          {getStatusIcon(blog.publishedAt)}
                          {blog.publishedAt ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-sm">
                            {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "Not published"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openViewModal(blog)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(blog)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Edit3 size={14} />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(blog._id)}
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
              {filteredBlogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
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
                        checked={selectedBlogs.includes(blog._id)}
                        onChange={() => handleSelectBlog(blog._id)}
                        className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                      />
                      <div>
                        <h3
                          className="cursor-pointer text-slate-100 font-medium text-sm hover:text-sky-400 transition-colors"
                          onClick={() => openViewModal(blog)}
                        >
                          {blog.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openViewModal(blog)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Eye size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(blog)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(blog._id)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 text-xs">{blog.authorId?.name}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {blog.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md text-xs border border-purple-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                    {blog.tags.length > 2 && (
                      <span className="px-2 py-1 bg-slate-600/50 text-slate-400 rounded-md text-xs">
                        +{blog.tags.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${getStatusColor(blog.publishedAt)}`}
                    >
                      {getStatusIcon(blog.publishedAt)}
                      {blog.publishedAt ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-xs">
                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "Not published"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Add Blog Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="add-blog-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="add-blog-title" className="text-lg font-bold text-slate-100">
                  Add New Blog
                </h2>
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
                  <label className="block text-xs font-medium text-slate-100 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={addFormData.title}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter blog title"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Content</label>
                  <textarea
                    name="content"
                    value={addFormData.content}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter blog content"
                    rows={4}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={addFormData.tags}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., React, JavaScript"
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
                    onClick={handleAddBlog}
                    className="cursor-pointer px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Add Blog
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Blog Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="edit-blog-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="edit-blog-title" className="text-lg font-bold text-slate-100">
                  Edit Blog
                </h2>
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
                  <label className="block text-xs font-medium text-slate-100 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter blog title"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Content</label>
                  <textarea
                    name="content"
                    value={editFormData.content}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter blog content"
                    rows={4}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={editFormData.tags}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., React, JavaScript"
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
                    onClick={handleEditBlog}
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

      {/* View Blog Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="view-blog-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="view-blog-title" className="text-lg font-bold text-slate-100">
                  Blog Details
                </h2>
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
                  <p className="text-slate-400 text-xs">Title</p>
                  <p className="text-slate-100 text-sm">{showViewModal.title}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Author</p>
                  <p className="text-slate-100 text-sm flex items-center gap-2">
                    <User size={12} className="text-slate-400" />
                    {showViewModal.authorId?.name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {showViewModal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md text-xs border border-purple-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${getStatusColor(showViewModal.publishedAt)}`}
                  >
                    {getStatusIcon(showViewModal.publishedAt)}
                    {showViewModal.publishedAt ? "Published" : "Draft"}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Published</p>
                  <p className="text-slate-100 text-sm">
                    {showViewModal.publishedAt
                      ? new Date(showViewModal.publishedAt).toLocaleDateString()
                      : "Not published"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Content</p>
                  <p className="text-slate-100 text-sm">{showViewModal.content}</p>
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
                    ? `Are you sure you want to delete ${selectedBlogs.length} blog(s)?`
                    : "Are you sure you want to delete this blog?"}
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
                    onClick={() => showDeleteModal.isBulk ? handleBulkDelete() : handleDeleteBlog(showDeleteModal.blogId)}
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
}