import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Briefcase, Code, Award, TrendingUp, Calendar, Target, Activity, Loader2 } from "lucide-react";
import axios from "axios";

export default function AnalyticsDashboard() {
  const [data, setData] = useState({
    userGrowthData: [],
    skillsDistribution: [],
    projectStatusData: [],
    experienceData: [],
    stats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}dashboard/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { success, message, data } = response.data;
        if (success) {
          setData(data);
        } else {
          setError(message);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Auto-dismiss error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Map icon strings to components
  const iconMap = {
    Users: Users,
    Briefcase: Briefcase,
    Code: Code,
    Award: Award,
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-slate-900">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 max-w-md w-full p-3 rounded-lg text-center bg-red-500/90 text-white z-50"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Analytics Dashboard</h1>
        <p className="text-secondary mt-2 text-sm sm:text-base">
          Comprehensive insights into users, projects, skills, and experience data.
        </p>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto text-accent animate-spin" size={40} />
          <p className="text-secondary mt-3 text-sm">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {data.stats.map((stat, index) => {
              const Icon = iconMap[stat.icon];
              return (
                <motion.div
                  key={stat.title}
                  className="bg-sidebar-bg rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-accent/50 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary text-xs sm:text-sm font-medium">{stat.title}</p>
                      <p className="text-lg sm:text-2xl font-bold text-primary mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp size={14} className={stat.color} />
                        <span className={`text-xs sm:text-sm ${stat.color}`}>{stat.change}</span>
                      </div>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon size={20} className={stat.color} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {/* User Growth Chart */}
            <motion.div
              className="bg-sidebar-bg rounded-lg p-4 sm:p-6 border border-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-accent" size={20} />
                <h2 className="text-lg sm:text-xl font-semibold text-primary">Growth Trends</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F8FAFC",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#38BDF8"
                    strokeWidth={3}
                    dot={{ fill: "#38BDF8", strokeWidth: 2, r: 4 }}
                    name="Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="projects"
                    stroke="#A78BFA"
                    strokeWidth={3}
                    dot={{ fill: "#A78BFA", strokeWidth: 2, r: 4 }}
                    name="Projects"
                  />
                  <Line
                    type="monotone"
                    dataKey="skills"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ fill: "#22C55E", strokeWidth: 2, r: 4 }}
                    name="Skills"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Skills Distribution */}
            <motion.div
              className="bg-sidebar-bg rounded-lg p-4 sm:p-6 border border-gray-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Code className="text-secondary-accent" size={20} />
                <h2 className="text-lg sm:text-xl font-semibold text-primary">Skills Distribution</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.skillsDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.skillsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F8FAFC",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Second Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {/* Experience Growth */}
            <motion.div
              className="bg-sidebar-bg rounded-lg p-4 sm:p-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-success" size={20} />
                <h2 className="text-lg sm:text-xl font-semibold text-primary">Experience Growth</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.experienceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F8FAFC",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="companies"
                    stackId="1"
                    stroke="#38BDF8"
                    fill="#38BDF8"
                    fillOpacity={0.6}
                    name="Companies"
                  />
                  <Area
                    type="monotone"
                    dataKey="roles"
                    stackId="1"
                    stroke="#A78BFA"
                    fill="#A78BFA"
                    fillOpacity={0.6}
                    name="Roles"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Project Status */}
            <motion.div
              className="bg-sidebar-bg rounded-lg p-4 sm:p-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-warning" size={20} />
                <h2 className="text-lg sm:text-xl font-semibold text-primary">Project Status</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.projectStatusData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#94A3B8" />
                  <YAxis dataKey="status" type="category" stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F8FAFC",
                    }}
                  />
                  <Bar dataKey="count" fill="#38BDF8" radius={[0, 4, 4, 0]}>
                    {data.projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}