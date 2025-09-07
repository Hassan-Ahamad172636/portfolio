"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  FileText,
  MessageSquare,
  Bell,
  X,
  ChevronDown,
  Briefcase,
  HelpCircle,
  Settings2,
} from "lucide-react"
import { Link, useLocation } from 'react-router-dom' // Import useLocation
import axios from "axios"

export default function Sidebar({ isOpen, onClose }) {
  const [expandedItems, setExpandedItems] = useState({})
  const location = useLocation() // Get current route

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/admin" },
    { id: "users", label: "Users", icon: Users, href: "/admin/users" },
    { id: "projects", label: "Projects", icon: ShoppingBag, href: "/admin/projects" },
    { id: "skills", label: "Skills", icon: BarChart3, href: "/admin/skills" },
    { id: "experience", label: "Experience", icon: Briefcase, href: "/admin/experience" },
    { id: "qa", label: "QA", icon: HelpCircle, href: "/admin/qa" },
    { id: "testimonial", label: "Testimonial", icon: MessageSquare, href: "/admin/testimonial" },
    { id: "blog", label: "Blog", icon: FileText, href: "/admin/blog" },
    { id: "settings", label: "Settings", icon: Settings2, href: "/admin/settings" },
  ];
  const [admin, setAdmin] = useState({})

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(import.meta.env.VITE_APP_BASE_URL + "user/getProfile", {
        headers: {
          Authorization: `Bearer ${token}`, // token header mein bhejna
        },
      });

      setAdmin(res.data); // state update async hoti hai
      console.log("API response:", res.data); // yaha sahi value milegi
    } catch (error) {
      console.error("Error fetching profile:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <motion.aside
      className="fixed left-0 top-0 z-50 h-full w-64 bg-sidebar-bg border-r border-gray-700 lg:translate-x-0"
      variants={sidebarVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col items-center p-6 shadow-sm">
          {/* Profile Image */}
          <motion.img
            src={admin?.data?.profilePicture} // yaha apna profilePicture URL lagana
            alt="Profile"
            className="w-20 h-20 rounded-full border-2 border-accent object-cover"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Name & Email */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-accent">{admin.data?.name}</h2>
            <p className="text-sm text-secondary truncate max-w-[160px]">
              {admin.data?.email}
            </p>
          </motion.div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 lg:hidden p-2 rounded-lg hover:bg-gray-700 text-secondary hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${location.pathname === item.href
                        ? "bg-accent text-white"
                        : "text-secondary hover:text-primary hover:bg-gray-700"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedItems[item.id] ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedItems[item.id] && (
                        <motion.ul
                          className="ml-6 mt-2 space-y-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.submenu.map((subItem) => (
                            <li key={subItem.id}>
                              <button
                                onClick={() => setActiveItem(subItem.id)}
                                className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${location.pathname === subItem.href
                                  ? "bg-secondary-accent text-white"
                                  : "text-secondary hover:text-primary hover:bg-gray-700"
                                  }`}
                              >
                                {subItem.label}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link to={item.href}>
                    <button
                      className={`cursor-pointer w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${location.pathname === item.href
                        ? "bg-accent text-white"
                        : "text-secondary hover:text-primary hover:bg-gray-700"
                        }`}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <motion.div
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div> */}
            <div className="flex-1">
              <p className="text-primary text-sm font-medium">{admin?.data?.name}</p>
              <p className="text-secondary text-xs">{admin?.data?.email}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  )
}