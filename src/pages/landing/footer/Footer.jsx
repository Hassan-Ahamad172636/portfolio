'use client';
import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

/* =======================
   FOOTER COMPONENT
======================= */
export default function Footer() {
  return (
    <footer className="relative bg-[#030303] border-t border-white/10 overflow-hidden">

      {/* Glow Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[500px] h-[120px] bg-indigo-500/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14">

        {/* TOP */}
        <div className="grid md:grid-cols-3 gap-12">

          {/* BRAND */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white">
              Hassan<span className="text-indigo-500">.</span>
            </h2>
            <p className="text-white/60 text-sm max-w-xs">
              MERN Stack & Frontend Developer crafting modern, fast & scalable
              digital experiences.
            </p>
          </motion.div>

          {/* QUICK LINKS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-white font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="hover:text-white transition cursor-pointer"><a href="#home">Home</a></li>
              <li className="hover:text-white transition cursor-pointer"><a href="#about">About</a></li>
              <li className="hover:text-white transition cursor-pointer"><a href="#projects">Projects</a></li>
              <li className="hover:text-white transition cursor-pointer"><a href="#contact">Contact</a></li>
            </ul>
          </motion.div>

          {/* SOCIAL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-white font-semibold">Connect</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-3 rounded-full bg-white/5 border border-white/10
                hover:bg-white/10 hover:scale-105 transition"
              >
                <Github size={18} className="text-white" />
              </a>
              <a
                href="#"
                className="p-3 rounded-full bg-white/5 border border-white/10
                hover:bg-white/10 hover:scale-105 transition"
              >
                <Linkedin size={18} className="text-white" />
              </a>
              <a
                href="#"
                className="p-3 rounded-full bg-white/5 border border-white/10
                hover:bg-white/10 hover:scale-105 transition"
              >
                <Twitter size={18} className="text-white" />
              </a>
              <a
                href="mailto:hassan.dev@email.com"
                className="p-3 rounded-full bg-white/5 border border-white/10
                hover:bg-white/10 hover:scale-105 transition"
              >
                <Mail size={18} className="text-white" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* DIVIDER */}
        <div className="my-10 h-px bg-white/10" />

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} Hassan Ahmad. All rights reserved.</p>
          <p>
            Built with <span className="text-white">React.js</span> &{" "}
            <span className="text-white">Tailwind CSS</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
