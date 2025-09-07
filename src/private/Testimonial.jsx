import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Star,
  MessageSquare,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Building,
  Calendar,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import axios from "axios";
import { useToast } from "ai-toast";

const TestimonialsPage = () => {
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [selectedTestimonials, setSelectedTestimonials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    designation: "",
    company: "",
    feedback: "",
    rating: 5,
    image: null,
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    designation: "",
    company: "",
    feedback: "",
    rating: 5,
    image: null,
  });
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
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

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("No authentication token found");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}testimonials/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTestimonials(response.data.data || []);
        setFilteredTestimonials(response.data.data || []);
      } catch (err) {
        showToast(err.message || "Failed to fetch testimonials");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Filter testimonials
  useEffect(() => {
    const filtered = testimonials.filter((testimonial) => {
      const matchesSearch =
        testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.feedback.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = filterRating === "all" || testimonial.rating.toString() === filterRating;
      return matchesSearch && matchesRating;
    });
    setFilteredTestimonials(filtered);
  }, [testimonials, searchTerm, filterRating]);

  const handleSelectAll = () => {
    setSelectedTestimonials(
      selectedTestimonials.length === filteredTestimonials.length
        ? []
        : filteredTestimonials.map((t) => t._id)
    );
  };

  const handleSelectTestimonial = (id) => {
    setSelectedTestimonials((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Handle Bulk Actions
  const handleBulkAction = async (action) => {
    if (action === "delete") {
      setShowDeleteModal({ action, testimonialId: null, isBulk: true });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (action === "export") {
        const exportData = testimonials
          .filter((t) => selectedTestimonials.includes(t._id))
          .map(({ name, designation, company, feedback, rating, image, createdAt }) => ({
            name,
            designation,
            company,
            feedback,
            rating,
            image,
            createdAt,
          }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "testimonials_export.json";
        link.click();
        URL.revokeObjectURL(url);
        showToast("Selected testimonials exported successfully");
      }
      setSelectedTestimonials([]);
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action} testimonials`);
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
        selectedTestimonials.map((id) =>
          axios.delete(`${import.meta.env.VITE_APP_BASE_URL}testimonials/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      showToast("Selected testimonials deleted successfully");
      setTestimonials((prev) => prev.filter((t) => !selectedTestimonials.includes(t._id)));
      setSelectedTestimonials([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete testimonials");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add Testimonial
  const handleAddTestimonial = async () => {
    if (!addFormData.name || !addFormData.feedback) {
      showToast("Name and feedback are required");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", addFormData.name);
      formData.append("designation", addFormData.designation);
      formData.append("company", addFormData.company);
      formData.append("feedback", addFormData.feedback);
      formData.append("rating", addFormData.rating);
      if (addFormData.image) {
        formData.append("image", addFormData.image);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}testimonials/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setTestimonials((prev) => [...prev, data]);
        setShowAddModal(false);
        setAddFormData({
          name: "",
          designation: "",
          company: "",
          feedback: "",
          rating: 5,
          image: null,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add testimonial");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Testimonial
  const handleEditTestimonial = async () => {
    if (!editFormData.name || !editFormData.feedback) {
      showToast("Name and feedback are required");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("designation", editFormData.designation);
      formData.append("company", editFormData.company);
      formData.append("feedback", editFormData.feedback);
      formData.append("rating", editFormData.rating);
      if (editFormData.image) {
        formData.append("image", editFormData.image);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}testimonials/update/${editFormData.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setTestimonials((prev) => prev.map((t) => (t._id === editFormData.id ? data : t)));
        setShowEditModal(null);
        if (editFileInputRef.current) editFileInputRef.current.value = "";
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update testimonial");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Testimonial
  const handleDeleteTestimonial = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}testimonials/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { success, message } = response.data;
      if (success) {
        showToast(message);
        setTestimonials((prev) => prev.filter((t) => t._id !== id));
        setSelectedTestimonials((prev) => prev.filter((t) => t !== id));
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete testimonial");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Form Changes
  const handleAddFormChange = (e) => {
    const { name, value, files } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value, files } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Open Edit Modal
  const openEditModal = (testimonial) => {
    setEditFormData({
      id: testimonial._id,
      name: testimonial.name,
      designation: testimonial.designation,
      company: testimonial.company,
      feedback: testimonial.feedback,
      rating: testimonial.rating,
      image: null,
    });
    setShowEditModal(testimonial._id);
  };

  // Open View Modal
  const openViewModal = (testimonial) => {
    setShowViewModal(testimonial);
  };

  // Open Delete Modal
  const openDeleteModal = (testimonialId = null, isBulk = false) => {
    setShowDeleteModal({ testimonialId, isBulk });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-current" : "text-slate-600"}`}
      />
    ));
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
            <MessageSquare className="text-sky-400" size={24} />
            Testimonials
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">Manage client testimonials and reviews</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="cursor-pointer bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
        >
          <Plus size={18} />
          Add Testimonial
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4"
      >
        {[
          {
            title: "Total Testimonials",
            value: testimonials.length,
            icon: MessageSquare,
            color: "sky",
            bgColor: "bg-sky-500/10",
            change: `+${testimonials.filter((t) => new Date(t.createdAt).getFullYear() === new Date().getFullYear()).length} this year`,
          },
          {
            title: "Average Rating",
            value: testimonials.length
              ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
              : "0.0",
            icon: Star,
            color: "purple",
            bgColor: "bg-purple-500/10",
            change: testimonials.length ? "Updated" : "N/A",
          },
          {
            title: "This Month",
            value: testimonials.filter(
              (t) => new Date(t.createdAt).getMonth() === new Date().getMonth()
            ).length,
            icon: Calendar,
            color: "green",
            bgColor: "bg-green-500/10",
            change: "Recent",
          },
          {
            title: "5 Star Reviews",
            value: testimonials.length
              ? `${Math.round((testimonials.filter((t) => t.rating === 5).length / testimonials.length) * 100)}%`
              : "0%",
            icon: Users,
            color: "amber",
            bgColor: "bg-amber-500/10",
            change: testimonials.length ? "Top rated" : "N/A",
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
              placeholder="Search by name, company, designation, or feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all" className="bg-slate-800">All Ratings</option>
            <option value="5" className="bg-slate-800">5 Stars</option>
            <option value="4" className="bg-slate-800">4 Stars</option>
            <option value="3" className="bg-slate-800">3 Stars</option>
            <option value="2" className="bg-slate-800">2 Stars</option>
            <option value="1" className="bg-slate-800">1 Star</option>
          </select>
          {selectedTestimonials.length > 0 && (
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
                <Upload size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Testimonials List */}
      {loading ? (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto text-sky-500 animate-spin" size={40} />
          <p className="text-slate-400 mt-3 text-sm">Loading testimonials...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
          <MessageSquare className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-base">
            {searchTerm || filterRating !== "all" ? "No testimonials found" : "Create your first testimonial to get started"}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {searchTerm || filterRating !== "all"
              ? "Try adjusting your search or filters"
              : "Add a new testimonial using the button above"}
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
                      checked={selectedTestimonials.length === filteredTestimonials.length && filteredTestimonials.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Client</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Company</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Rating</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Feedback</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Date</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <AnimatePresence>
                  {filteredTestimonials.map((testimonial, index) => (
                    <motion.tr
                      key={testimonial._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedTestimonials.includes(testimonial._id)}
                          onChange={() => handleSelectTestimonial(testimonial._id)}
                          className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={import.meta.env.VITE_APP_FILE_URL + testimonial.image || "/placeholder.svg"}
                            alt={import.meta.env.VITE_APP_FILE_URL + testimonial.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-600"
                          />
                          <div>
                            <p className="text-slate-100 font-medium text-sm">{testimonial.name}</p>
                            <p className="text-slate-400 text-xs">{testimonial.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 text-sm">{testimonial.company}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {renderStars(testimonial.rating)}
                          <span className="text-slate-300 text-xs ml-2">({testimonial.rating})</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-slate-300 text-sm max-w-xs line-clamp-2">{testimonial.feedback}</p>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-400 text-xs">
                          {new Date(testimonial.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openViewModal(testimonial)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(testimonial)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Edit3 size={14} />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(testimonial._id)}
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
              {filteredTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
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
                        checked={selectedTestimonials.includes(testimonial._id)}
                        onChange={() => handleSelectTestimonial(testimonial._id)}
                        className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                      />
                      <div className="flex items-center gap-2">
                        <img
                          src={import.meta.env.VITE_APP_FILE_URL + testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-600"
                        />
                        <div>
                          <p className="text-slate-100 font-medium text-sm">{testimonial.name}</p>
                          <p className="text-slate-400 text-xs">{testimonial.designation}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openViewModal(testimonial)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Eye size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(testimonial)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(testimonial._id)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 text-xs">{testimonial.company}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {renderStars(testimonial.rating)}
                    <span className="text-slate-300 text-xs ml-2">({testimonial.rating})</span>
                  </div>
                  <div className="mt-2 text-slate-300 text-xs line-clamp-2">{testimonial.feedback}</div>
                  <div className="mt-2 text-slate-400 text-xs">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Add Testimonial Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="add-testimonial-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="add-testimonial-title" className="text-lg font-bold text-slate-100">
                  Add New Testimonial
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
                  <label className="block text-xs font-medium text-slate-100 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={addFormData.name}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter client name"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={addFormData.designation}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter designation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={addFormData.company}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Feedback</label>
                  <textarea
                    name="feedback"
                    value={addFormData.feedback}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter feedback"
                    rows={3}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Rating</label>
                  <select
                    name="rating"
                    value={addFormData.rating}
                    onChange={handleAddFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num} className="bg-slate-800">{num} Star{num > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleAddFormChange}
                    ref={fileInputRef}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm file:bg-sky-500/20 file:text-sky-400 file:border-none file:px-3 file:py-2 file:rounded file:text-sm"
                    accept="image/*"
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
                    onClick={handleAddTestimonial}
                    className="cursor-pointer px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Add Testimonial
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Testimonial Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="edit-testimonial-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="edit-testimonial-title" className="text-lg font-bold text-slate-100">
                  Edit Testimonial
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
                  <label className="block text-xs font-medium text-slate-100 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter client name"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={editFormData.designation}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter designation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={editFormData.company}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Feedback</label>
                  <textarea
                    name="feedback"
                    value={editFormData.feedback}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter feedback"
                    rows={3}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Rating</label>
                  <select
                    name="rating"
                    value={editFormData.rating}
                    onChange={handleEditFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num} className="bg-slate-800">{num} Star{num > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleEditFormChange}
                    ref={editFileInputRef}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm file:bg-sky-500/20 file:text-sky-400 file:border-none file:px-3 file:py-2 file:rounded file:text-sm"
                    accept="image/*"
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
                    onClick={handleEditTestimonial}
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

      {/* View Testimonial Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="view-testimonial-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="view-testimonial-title" className="text-lg font-bold text-slate-100">
                  Testimonial Details
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
                <div className="flex items-center gap-3">
                  <img
                    src={import.meta.env.VITE_APP_FILE_URL + showViewModal.image || "/placeholder.svg"}
                    alt={showViewModal.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <p className="text-slate-100 font-medium text-sm">{showViewModal.name}</p>
                    <p className="text-slate-400 text-xs">{showViewModal.designation}</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Company</p>
                  <p className="text-slate-100 text-sm flex items-center gap-2">
                    <Building size={12} className="text-slate-400" />
                    {showViewModal.company}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Rating</p>
                  <div className="flex items-center gap-1">
                    {renderStars(showViewModal.rating)}
                    <span className="text-slate-300 text-xs ml-2">({showViewModal.rating})</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Feedback</p>
                  <p className="text-slate-100 text-sm">{showViewModal.feedback}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Date</p>
                  <p className="text-slate-100 text-sm">
                    {new Date(showViewModal.createdAt).toLocaleDateString()}
                  </p>
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
                    ? `Are you sure you want to delete ${selectedTestimonials.length} testimonial(s)?`
                    : "Are you sure you want to delete this testimonial?"}
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
                    onClick={() => showDeleteModal.isBulk ? handleBulkDelete() : handleDeleteTestimonial(showDeleteModal.testimonialId)}
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

export default TestimonialsPage;