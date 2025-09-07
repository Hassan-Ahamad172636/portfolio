import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  Download,
  Upload,
  X,
} from "lucide-react";
import axios from "axios";
import { useToast } from "ai-toast";

const QAPage = () => {
  const { showToast } = useToast();
  const [qaRecords, setQARecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    type: "manual",
    toolsUsed: "",
    description: "",
    reportLink: "",
    reportFile: null,
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    type: "manual",
    toolsUsed: "",
    description: "",
    reportLink: "",
    reportFile: null,
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

  // Fetch QA records
  useEffect(() => {
    const fetchQARecords = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("No authentication token found");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}qa/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQARecords(response.data.data || []);
        setFilteredRecords(response.data.data || []);
      } catch (err) {
        showToast(err.message || "Failed to fetch QA records");
      } finally {
        setLoading(false);
      }
    };
    fetchQARecords();
  }, []);

  // Filter QA records
  useEffect(() => {
    const filtered = qaRecords.filter((qa) => {
      const matchesSearch =
        qa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qa.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qa.toolsUsed.some((tool) => tool.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === "all" || qa.type === typeFilter;
      const matchesStatus = statusFilter === "all" || qa.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
    setFilteredRecords(filtered);
  }, [qaRecords, searchTerm, typeFilter, statusFilter]);

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredRecords.length
        ? []
        : filteredRecords.map((qa) => qa._id)
    );
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Bulk Actions
  const handleBulkAction = async (action) => {
    if (action === "delete") {
      setShowDeleteModal({ action, qaId: null, isBulk: true });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (action === "export") {
        const exportData = qaRecords
          .filter((qa) => selectedItems.includes(qa._id))
          .map(({ title, type, toolsUsed, description, reportLink, status, createdAt }) => ({
            title,
            type,
            toolsUsed,
            description,
            reportLink,
            status,
            createdAt,
          }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "qa_records_export.json";
        link.click();
        URL.revokeObjectURL(url);
        showToast("Selected QA records exported successfully");
      }
      setSelectedItems([]);
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action} QA records`);
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
        selectedItems.map((qaId) =>
          axios.delete(`${import.meta.env.VITE_APP_BASE_URL}qa/delete/${qaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      showToast("Selected QA records deleted successfully");
      setQARecords((prev) => prev.filter((qa) => !selectedItems.includes(qa._id)));
      setSelectedItems([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete QA records");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  // Handle Add QA Record
  const handleAddQA = async () => {
    if (!addFormData.title || !addFormData.description) {
      showToast("Title and description are required");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", addFormData.title);
      formData.append("type", addFormData.type);
      formData.append("toolsUsed", addFormData.toolsUsed);
      formData.append("description", addFormData.description);
      if (addFormData.reportFile) {
        formData.append("reportFile", { file: addFormData.reportFile });
      } else {
        formData.append("reportLink", addFormData.reportLink);
      }

      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}qa/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, message, data } = response.data;
      if (success) {
        showToast(message);
        setQARecords((prev) => [...prev, data]);
        setShowAddModal(false);
        setAddFormData({ title: "", type: "manual", toolsUsed: "", description: "", reportLink: "", reportFile: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add QA record");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit QA Record
  const handleEditQA = async () => {
    if (!editFormData.title || !editFormData.description) {
      showToast("Title and description are required");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", editFormData.title);
      formData.append("type", editFormData.type);
      formData.append("toolsUsed", editFormData.toolsUsed);
      formData.append("description", editFormData.description);
      if (editFormData.reportFile) {
        formData.append("reportFile", editFormData.reportFile);
      } else {
        formData.append("reportLink", editFormData.reportLink);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}qa/update/${editFormData.id}`,
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
        setQARecords((prev) => prev.map((qa) => (qa._id === editFormData.id ? data : qa)));
        setShowEditModal(null);
        if (editFileInputRef.current) editFileInputRef.current.value = "";
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update QA record");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete QA Record
  const handleDeleteQA = async (qaId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}qa/delete/${qaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, message } = response.data;
      if (success) {
        showToast(message);
        setQARecords((prev) => prev.filter((qa) => qa._id !== qaId));
        setSelectedItems((prev) => prev.filter((id) => id !== qaId));
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete QA record");
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
  const openEditModal = (qa) => {
    setEditFormData({
      id: qa._id,
      title: qa.title,
      type: qa.type,
      toolsUsed: qa.toolsUsed.join(", "),
      description: qa.description,
      reportLink: qa.reportLink,
      reportFile: null,
    });
    setShowEditModal(qa._id);
  };

  // Open View Modal
  const openViewModal = (qa) => {
    setShowViewModal(qa);
  };

  // Open Delete Modal
  const openDeleteModal = (qaId = null, isBulk = false) => {
    setShowDeleteModal({ qaId, isBulk });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      passed: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
      failed: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
      pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    // return (
    //   <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${config.color}`}>
    //     <Icon className="w-3 h-3" />
    //     {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
    //   </span>
    // );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      manual: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      automation: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    };
    const config = typeConfig[type] || typeConfig.manual;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${config.color}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
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
            <TestTube className="text-sky-400" size={24} />
            QA Management
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">Manage and track quality assurance testing</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="cursor-pointer bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
        >
          <Plus size={18} />
          Add QA Test
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4"
      >
        {[
          {
            title: "Total Tests",
            value: qaRecords.length,
            icon: TestTube,
            color: "sky",
            change: `+${qaRecords.filter((qa) => new Date(qa.createdAt).getFullYear() === new Date().getFullYear()).length} this year`,
          },
          // {
          //   title: "Passed Tests",
          //   value: qaRecords.filter((qa) => qa.status === "passed").length,
          //   icon: CheckCircle,
          //   color: "green",
          //   change: `+${qaRecords.filter((qa) => qa.status === "passed" && new Date(qa.createdAt).getFullYear() === new Date().getFullYear()).length} this year`,
          // },
          // {
          //   title: "Failed Tests",
          //   value: qaRecords.filter((qa) => qa.status === "failed").length,
          //   icon: XCircle,
          //   color: "red",
          //   change: `${qaRecords.filter((qa) => qa.status === "failed" && new Date(qa.createdAt).getFullYear() === new Date().getFullYear()).length} this year`,
          // },
          // {
          //   title: "Pending Tests",
          //   value: qaRecords.filter((qa) => qa.status === "pending").length,
          //   icon: Clock,
          //   color: "yellow",
          //   change: `+${qaRecords.filter((qa) => qa.status === "pending" && new Date(qa.createdAt).getFullYear() === new Date().getFullYear()).length} this year`,
          // },
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
              placeholder="Search tests, descriptions, or tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all" className="bg-slate-800">All Types</option>
            <option value="manual" className="bg-slate-800">Manual</option>
            <option value="automation" className="bg-slate-800">Automation</option>
          </select>
          {/* <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all" className="bg-slate-800">All Status</option>
            <option value="passed" className="bg-slate-800">Passed</option>
            <option value="failed" className="bg-slate-800">Failed</option>
            <option value="pending" className="bg-slate-800">Pending</option>
          </select> */}
          {selectedItems.length > 0 && (
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

      {/* QA Records List */}
      {loading ? (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto text-sky-500 animate-spin" size={40} />
          <p className="text-slate-400 mt-3 text-sm">Loading QA records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
          <TestTube className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-base">
            {searchTerm || typeFilter !== "all" || statusFilter !== "all"
              ? "No QA tests found"
              : "Create your first QA test to get started"}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {searchTerm || typeFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Add a new test using the button above"}
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
                      checked={selectedItems.length === filteredRecords.length && filteredRecords.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Test Title</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Type</th>
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Tools Used</th>
                  {/* <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Status</th> */}
                  {/* <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Last Run</th> */}
                  <th className="p-3 text-left text-sm font-medium text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <AnimatePresence>
                  {filteredRecords.map((qa, index) => (
                    <motion.tr
                      key={qa._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(qa._id)}
                          onChange={() => handleSelectItem(qa._id)}
                          className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-slate-100 font-medium text-sm">{qa.title}</p>
                          <p className="text-slate-400 text-xs mt-1 line-clamp-2 max-w-xs">{qa.description}</p>
                        </div>
                      </td>
                      <td className="p-3">{getTypeBadge(qa.type)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {qa.toolsUsed.slice(0, 2).map((tool, idx) => (
                            <span key={idx} className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded">
                              {tool}
                            </span>
                          ))}
                          {qa.toolsUsed.length > 2 && (
                            <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded">
                              +{qa.toolsUsed.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* <td className="p-3">{getStatusBadge(qa.status)}</td> */}
                      {/* <td className="p-3 text-slate-300 text-xs">
                        {new Date(qa.lastRun || qa.createdAt).toLocaleDateString()}
                      </td> */}
                      <td className="p-3">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openViewModal(qa)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(qa)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Edit3 size={14} />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(qa._id)}
                            disabled={loading}
                            className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-1 disabled:opacity-50 text-xs"
                          >
                            <Trash2 size={14} />
                            Delete
                          </motion.button>
                          {qa.reportLink && (
                            <a
                              href={qa.reportLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center gap-1 text-xs"
                            >
                              <ExternalLink size={14} />
                              Report
                            </a>
                          )}
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
              {filteredRecords.map((qa, index) => (
                <motion.div
                  key={qa._id}
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
                        checked={selectedItems.includes(qa._id)}
                        onChange={() => handleSelectItem(qa._id)}
                        className="cursor-pointer rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/20"
                      />
                      <div>
                        <p className="text-slate-100 font-medium text-sm">{qa.title}</p>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{qa.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openViewModal(qa)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Eye size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(qa)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(qa._id)}
                        disabled={loading}
                        className="cursor-pointer p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                      {qa.reportLink && (
                        <a
                          href={qa.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span>{getTypeBadge(qa.type)}</span>
                    {/* <span>{getStatusBadge(qa.status)}</span> */}
                  </div>
                  <div className="mt-2 text-slate-300 text-xs">
                    Last Run: {new Date(qa.lastRun || qa.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {qa.toolsUsed.slice(0, 2).map((tool, idx) => (
                      <span key={idx} className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded">
                        {tool}
                      </span>
                    ))}
                    {qa.toolsUsed.length > 2 && (
                      <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded">
                        +{qa.toolsUsed.length - 2}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Add QA Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="add-qa-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="add-qa-title" className="text-lg font-bold text-slate-100">Add New QA Test</h2>
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
                    placeholder="Enter test title"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Type</label>
                  <select
                    name="type"
                    value={addFormData.type}
                    onChange={handleAddFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="manual" className="bg-slate-800">Manual</option>
                    <option value="automation" className="bg-slate-800">Automation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Tools Used (comma-separated)</label>
                  <input
                    type="text"
                    name="toolsUsed"
                    value={addFormData.toolsUsed}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., Postman, Selenium"
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
                {/* <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Report File</label>
                  <input
                    type="file"
                    name="reportFile"
                    onChange={handleAddFormChange}
                    ref={fileInputRef}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm file:bg-sky-500/20 file:text-sky-400 file:border-none file:px-3 file:py-2 file:rounded file:text-sm"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div> */}
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Report Link (if no file)</label>
                  <input
                    type="url"
                    name="reportLink"
                    value={addFormData.reportLink}
                    onChange={handleAddFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter report URL"
                    disabled={addFormData.reportFile}
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
                    onClick={handleAddQA}
                    className="cursor-pointer px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Add QA Test
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit QA Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="edit-qa-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="edit-qa-title" className="text-lg font-bold text-slate-100">Edit QA Test</h2>
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
                    placeholder="Enter test title"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Type</label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditFormChange}
                    className="cursor-pointer w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="manual" className="bg-slate-800">Manual</option>
                    <option value="automation" className="bg-slate-800">Automation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Tools Used (comma-separated)</label>
                  <input
                    type="text"
                    name="toolsUsed"
                    value={editFormData.toolsUsed}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., Postman, Selenium"
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
                {/* <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Report File</label>
                  <input
                    type="file"
                    name="reportFile"
                    onChange={handleEditFormChange}
                    ref={editFileInputRef}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm file:bg-sky-500/20 file:text-sky-400 file:border-none file:px-3 file:py-2 file:rounded file:text-sm"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div> */}
                <div>
                  <label className="block text-xs font-medium text-slate-100 mb-1">Report Link (if no file)</label>
                  <input
                    type="url"
                    name="reportLink"
                    value={editFormData.reportLink}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter report URL"
                    disabled={editFormData.reportFile}
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
                    onClick={handleEditQA}
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

      {/* View QA Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
            role="dialog"
            aria-labelledby="view-qa-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 id="view-qa-title" className="text-lg font-bold text-slate-100">QA Test Details</h2>
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
                  <p className="text-slate-100 font-medium text-base">{showViewModal.title}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Type</p>
                  <p className="text-slate-100 text-sm">{getTypeBadge(showViewModal.type)}</p>
                </div>
                {/* <div>
                  <p className="text-slate-400 text-xs">Status</p>
                  <p className="text-slate-100 text-sm">{getStatusBadge(showViewModal.status)}</p>
                </div> */}
                <div>
                  <p className="text-slate-400 text-xs">Description</p>
                  <p className="text-slate-100 text-sm">{showViewModal.description}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Tools Used</p>
                  <div className="flex flex-wrap gap-1">
                    {showViewModal.toolsUsed.map((tool, idx) => (
                      <span key={idx} className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
                {/* <div>
                  <p className="text-slate-400 text-xs">Last Run</p>
                  <p className="text-slate-100 text-sm">
                    {new Date(showViewModal.lastRun || showViewModal.createdAt).toLocaleDateString()}
                  </p>
                </div> */}
                {showViewModal.reportLink && (
                  <div>
                    <p className="text-slate-400 text-xs">Report</p>
                    <a
                      href={showViewModal.reportLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer text-blue-400 text-sm hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      View Report
                    </a>
                  </div>
                )}
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
                    ? `Are you sure you want to delete ${selectedItems.length} QA record(s)?`
                    : "Are you sure you want to delete this QA record?"}
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
                    onClick={() => showDeleteModal.isBulk ? handleBulkDelete() : handleDeleteQA(showDeleteModal.qaId)}
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

export default QAPage;