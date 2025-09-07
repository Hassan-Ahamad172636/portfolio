"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {/* Mobile Sidebar (only render when open) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden bg-sidebar"
          >
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (always visible) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-sidebar">
        <Sidebar isOpen />
      </div>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Topbar */}
        <Topbar onMenuClick={() => {
          setSidebarOpen(true)
        }} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet /> {/* Nested routes yahan render honge */}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
