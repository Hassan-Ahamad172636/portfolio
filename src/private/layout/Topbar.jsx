import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Bell, Settings, LogOut, ChevronDown } from "lucide-react"
import axios from "axios"
import { Link } from "react-router-dom"

export default function Topbar({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [admin, setAdmin] = useState({})
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [readNotifications, setReadNotifications] = useState(() => {
    // Initialize read notifications from localStorage
    const stored = localStorage.getItem("readNotifications")
    return stored ? JSON.parse(stored) : {}
  })

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}user/getProfile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setAdmin(res.data)
    } catch (error) {
      console.error("Error fetching profile:", error.response?.data || error.message)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}contact/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const { success, data, message } = res.data
      if (success) {
        // Update notifications with read status from localStorage
        const updatedNotifications = data.map(notification => ({
          ...notification,
          read: !!readNotifications[notification._id]
        }))
        setNotifications(updatedNotifications)
        setUnreadCount(updatedNotifications.filter(n => !n.read).length)
      } else {
        console.error("Error fetching notifications:", message)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message)
    }
  }

  const markAsRead = (id) => {
    // Update readNotifications state and localStorage
    const updatedReadNotifications = { ...readNotifications, [id]: true }
    setReadNotifications(updatedReadNotifications)
    localStorage.setItem("readNotifications", JSON.stringify(updatedReadNotifications))
    
    // Update notifications state
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n))
    )
    setUnreadCount(prev => prev - 1)
  }

  useEffect(() => {
    fetchProfile()
    fetchNotifications()
  }, [])

  // Format createdAt to relative time
  const formatRelativeTime = (date) => {
    const now = new Date()
    const diffMs = now - new Date(date)
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `${diffSec} sec ago`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} min ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
    const diffDay = Math.floor(diffHr / 24)
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  }

  return (
    <header className="bg-sidebar-bg border-b border-gray-700 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="cursor-pointer lg:hidden p-2 rounded-lg hover:bg-gray-700 text-secondary hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfile(false)
              }}
              className="relative cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Notifications (${unreadCount} unread)`}
            >
              <Bell className="text-secondary" size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-accent rounded-full text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-[20rem] sm:w-[22rem] bg-sidebar border border-gray-700 rounded-lg shadow-xl z-50"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-primary font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-secondary text-sm">No new messages</p>
                    ) : (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification._id}
                          className={`cursor-pointer p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors ${notification.read ? "" : "bg-gray-800/50"}`}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-primary text-sm font-medium">
                                {notification.name} <span className="text-secondary">({notification.email})</span>
                              </p>
                              <p className="text-secondary text-xs mt-1 truncate">
                                {notification.message.length > 50
                                  ? notification.message.slice(0, 50) + "..."
                                  : notification.message}
                              </p>
                              <p className="text-secondary text-xs mt-1">
                                {formatRelativeTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-accent rounded-full mt-1"></div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  {/* <div className="p-4">
                    <Link to="/contacts">
                      <button className="cursor-pointer w-full text-center text-accent hover:text-accent/80 text-sm font-medium transition-colors">
                        View All Messages
                      </button>
                    </Link>
                  </div> */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => {
                setShowProfile(!showProfile)
                setShowNotifications(false)
              }}
              className="cursor-pointer flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {admin?.data?.name?.charAt(0) || "A"}
                </span>
              </div>
              <span className="text-primary font-medium hidden sm:block">
                {admin?.data?.name || "Admin"}
              </span>
              <ChevronDown className="text-secondary" size={16} />
            </motion.button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl z-50"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-primary font-medium">{admin?.data?.name || "Admin"}</p>
                    <p className="text-secondary text-sm">
                      {admin?.data?.email?.length > 20
                        ? admin?.data?.email?.slice(0, 20) + "..."
                        : admin?.data?.email || "No email"}
                    </p>
                  </div>
                  <div className="py-2">
                    {[
                      { icon: Settings, link: "/settings", label: "Settings", action: () => {} },
                      { icon: LogOut, link: "/", label: "Logout", action: () => { localStorage.removeItem('token') } },
                    ].map((item, index) => (
                      <motion.div
                        key={`${item.label}-${index}`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          to={item.link}
                          className="flex items-center gap-3 px-4 py-2 text-secondary hover:text-primary hover:bg-gray-700 transition-colors w-full"
                          onClick={item.action}
                          aria-label={item.label}
                        >
                          <item.icon size={16} />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}