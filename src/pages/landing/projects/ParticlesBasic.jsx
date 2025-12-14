"use client";
import { Particles } from "@/components/ui/shadcn-io/particles";
import { motion } from "framer-motion";
import React from "react";
import webimage from '../../../assets/webplaceholder.jpg'

// Elegant floating shapes
function ElegantShape({ className, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[3px] border border-white/10 shadow-lg`} />
      </motion.div>
    </motion.div>
  );
}

const projects = [
  {
    title: "Portfolio Website",
    description: "A personal portfolio built with Next.js and Tailwind CSS.",
    image: webimage,
    link: "#",
  },
  {
    title: "E-commerce App",
    description: "Full-stack MERN e-commerce platform with Stripe payment.",
    image: webimage,
    link: "#",
  },
  {
    title: "Chat Application",
    description: "Real-time chat app using Socket.io and Node.js backend.",
    image: webimage,
    link: "#",
  },
  {
    title: "Blog Platform",
    description: "Dynamic blog with Markdown support and authentication.",
    image: webimage,
    link: "#",
  },
];

export default function ProjectsShowcase() {
  return (
    <div id="projects" className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[#030303]">
      {/* Particles Background */}
      <Particles className="absolute inset-0" quantity={100} ease={80} color="#ffffff" refresh />

      {/* Floating Shapes */}
      <ElegantShape className="left-[-10%] top-[10%]" width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" delay={0.2} />
      <ElegantShape className="right-[0%] top-[60%]" width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" delay={0.4} />
      <ElegantShape className="left-[5%] bottom-[5%]" width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" delay={0.3} />

      {/* Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative z-999  text-center text-6xl font-bold text-white mb-10"
      >
        My Projects
      </motion.h2>

      {/* Projects Grid */}
      <div className="mb-5 relative z-10 grid w-full max-w-6xl gap-8 px-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <motion.a
            key={index}
            href={project.link}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-cyan-500/20 p-1 shadow-2xl shadow-black/40 backdrop-blur-lg"
          >
            <div className="flex flex-col h-full items-center justify-center gap-4 rounded-3xl bg-[#0f0f0f]/80 p-6 text-center text-white border border-white/10">
              {project.image && (
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-36 w-full rounded-xl object-cover border border-white/10 shadow-lg"
                />
              )}
              <h3 className="text-xl font-semibold">{project.title}</h3>
              <p className="text-sm text-white/70">{project.description}</p>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Bottom fade overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" /> */}
    </div>
  );
}
