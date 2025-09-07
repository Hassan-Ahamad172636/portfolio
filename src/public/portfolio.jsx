"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Code2,
  Palette,
  Database,
  Smartphone,
  ChevronDown,
  MapPin,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import axios from "axios"
import { useToast } from "ai-toast"

export default function Portfolio() {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingSkills, setIsLoadingSkills] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  }

  const iconMap = {
    Code2: Code2,
    Palette: Palette,
    Database: Database,
    Smartphone: Smartphone,
  }

  // Fetch projects and skills on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}project/public`)
        const { success, data, message } = response.data
        if (success) {
          setProjects(data)
          // Initialize image index for each project
          setCurrentImageIndex(data.reduce((acc, project) => ({
            ...acc,
            [project._id]: 0
          }), {}))
        } else {
          showToast(message)
        }
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to fetch projects")
      } finally {
        setIsLoadingProjects(false)
      }
    }

    const fetchSkills = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}skill/public`)
        const { success, data, message } = response.data
        if (success) {
          setSkills(data)
        } else {
          showToast(message)
        }
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to fetch skills")
      } finally {
        setIsLoadingSkills(false)
      }
    }

    fetchProjects()
    fetchSkills()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      showToast("Name, email, and message are required")
      return
    }
    setIsSubmitting(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}contacts/create`, formData)
      const { success, message } = response.data
      if (success) {
        showToast(message)
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        showToast(message)
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send message")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (projectId, direction) => {
    setCurrentImageIndex((prev) => {
      const project = projects.find(p => p._id === projectId)
      const images = project.images && project.images.length > 0 ? project.images : ["/placeholder.svg"]
      const currentIdx = prev[projectId] || 0
      let newIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1
      if (newIdx >= images.length) newIdx = 0
      if (newIdx < 0) newIdx = images.length - 1
      return { ...prev, [projectId]: newIdx }
    })
  }

  const openProjectDialog = (project) => {
    setSelectedProject(project)
  }

  const closeProjectDialog = () => {
    setSelectedProject(null)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full bg-slate-800/80 backdrop-blur-md border-b border-slate-600 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div className="text-xl font-bold text-sky-500" whileHover={{ scale: 1.05 }}>
            Portfolio
          </motion.div>
          <div className="hidden md:flex space-x-8">
            {["About", "Skills", "Projects", "Contact"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-slate-400 hover:text-sky-500 transition-colors"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance" variants={fadeInUp}>
              Hi, I'm <span className="text-sky-500">Hassan Ahmad</span>
            </motion.h1>
            <motion.p className="text-xl md:text-2xl text-slate-400 mb-8 text-pretty" variants={fadeInUp}>
              Full Stack Developer & UI/UX Designer
            </motion.p>
            <motion.p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto text-pretty" variants={fadeInUp}>
              I create beautiful, functional, and user-centered digital experiences that solve real-world problems with
              clean code and thoughtful design.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeInUp}>
              <motion.button
                className="bg-sky-500 text-white px-8 py-3 rounded-xl font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Work
              </motion.button>
              <motion.button
                className="border border-slate-600 text-slate-50 px-8 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download CV
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              About <span className="text-sky-500">Me</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="bg-slate-800 p-8 rounded-xl border border-slate-600">
                  <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                    I'm a passionate full-stack developer with 3+ years of experience creating digital solutions that
                    bridge the gap between design and technology.
                  </p>
                  <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                    My journey started with curiosity about how websites work, and it has evolved into a love for
                    creating seamless user experiences with clean, efficient code.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Your Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Available for work</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <div className="w-80 h-80 bg-gradient-to-br from-sky-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 bg-slate-800 rounded-full flex items-center justify-center">
                    <Code2 className="w-24 h-24 text-sky-500" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              My <span className="text-sky-500">Skills</span>
            </h2>
            {isLoadingSkills ? (
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              </div>
            ) : skills.length === 0 ? (
              <p className="text-center text-slate-400">No skills found.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {skills.map((skill, index) => {
                  const IconComponent = iconMap[skill.icon] || Code2
                  return (
                    <motion.div
                      key={skill.name}
                      className="bg-slate-800 p-6 rounded-xl border border-slate-600 text-center"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <IconComponent className="w-12 h-12 text-sky-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-3">{skill.name}</h3>
                      <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                        <motion.div
                          className="bg-sky-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        />
                      </div>
                      <span className="text-sm text-slate-400">{skill.level}%</span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Featured <span className="text-sky-500">Projects</span>
            </h2>
            {isLoadingProjects ? (
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-center text-slate-400">No projects found. Start creating some awesome projects!</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => {
                  const images = project.images && project.images.length > 0 ? project.images : ["/placeholder.svg"]
                  const currentIdx = currentImageIndex[project._id] || 0
                  return (
                    <motion.div
                      key={project._id}
                      className="bg-slate-800 rounded-xl border border-slate-600 overflow-hidden group"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="relative overflow-hidden h-48">
                        <AnimatePresence>
                          <motion.img
                            key={`${project._id}-${currentIdx}`}
                            src={`${images[currentIdx]}`}
                            alt={`${project.title} image ${currentIdx + 1}`}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3 }}
                          />
                        </AnimatePresence>
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => handleImageChange(project._id, "prev")}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-800/70 p-2 rounded-full hover:bg-slate-800"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-5 h-5 text-slate-50" />
                            </button>
                            <button
                              onClick={() => handleImageChange(project._id, "next")}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-800/70 p-2 rounded-full hover:bg-slate-800"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-5 h-5 text-slate-50" />
                            </button>
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                              {images.map((_, idx) => (
                                <button
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${idx === currentIdx ? "bg-sky-500" : "bg-slate-600"}`}
                                  onClick={() => setCurrentImageIndex(prev => ({ ...prev, [project._id]: idx }))}
                                  aria-label={`Go to image ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                        <div className="absolute inset-0 bg-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <ExternalLink className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                        <p className="text-slate-400 mb-4 text-sm leading-relaxed">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.techStack.map((tech) => (
                            <span key={tech} className="bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4">
                          <motion.a
                            href={project.liveLink}
                            className={`inline-flex items-center gap-2 ${project.liveLink ? "text-sky-500 hover:text-purple-500" : "text-slate-500 cursor-not-allowed"} transition-colors`}
                            whileHover={project.liveLink ? { x: 5 } : {}}
                          >
                            View Project <ExternalLink className="w-4 h-4" />
                          </motion.a>
                          <motion.button
                            onClick={() => openProjectDialog(project)}
                            className="cursor-pointer inline-flex items-center gap-2 text-sky-500 hover:text-purple-500 transition-colors"
                            whileHover={{ x: 5 }}
                          >
                            View Details
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Let's <span className="text-sky-500">Connect</span>
            </h2>
            <p className="text-lg text-slate-400 mb-12 text-center text-pretty">
              I'm always interested in new opportunities and collaborations. Let's discuss how we can work together!
            </p>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                className="bg-slate-800 p-8 rounded-xl border border-slate-600"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold mb-6">Send me a message</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                      placeholder="Your Name"
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                      placeholder="your.email@example.com"
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                      placeholder="Project Discussion"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                    <textarea
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors resize-none"
                      placeholder="Tell me about your project..."
                      aria-required="true"
                    />
                  </div>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-sky-500 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:bg-sky-400"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </motion.button>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div>
                  <h3 className="text-xl font-semibold mb-6">Get in touch</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-sky-500/10 p-3 rounded-lg">
                        <Mail className="w-5 h-5 text-sky-500" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-slate-400">hassan.ahmad@example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-sky-500/10 p-3 rounded-lg">
                        <MapPin className="w-5 h-5 text-sky-500" />
                      </div>
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-slate-400">Your City, Country</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-sky-500/10 p-3 rounded-lg">
                        <Calendar className="w-5 h-5 text-sky-500" />
                      </div>
                      <div>
                        <p className="font-medium">Availability</p>
                        <p className="text-slate-400">Available for freelance</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Follow me</h4>
                  <div className="flex gap-4">
                    {[
                      { icon: Mail, href: "mailto:hassan.ahmad@example.com", label: "Email" },
                      { icon: Github, href: "https://github.com/yourusername", label: "GitHub" },
                      { icon: Linkedin, href: "https://linkedin.com/in/yourusername", label: "LinkedIn" },
                    ].map((social, index) => (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        className="bg-slate-800 p-3 rounded-lg border border-slate-600 hover:border-sky-500 transition-colors group"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <social.icon className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-600">
                  <h4 className="font-semibold mb-3">Let's work together!</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    I'm passionate about creating amazing digital experiences. Whether you have a project in mind or
                    just want to chat about technology, I'd love to hear from you.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Detail Dialog */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProjectDialog}
          >
            <motion.div
              className="bg-slate-800 rounded-xl border border-slate-600 max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeProjectDialog}
                className="absolute top-4 right-4 text-slate-400 hover:text-sky-500"
                aria-label="Close dialog"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-sky-500">{selectedProject.title}</h2>
              <div className="relative h-64 mb-4">
                <AnimatePresence>
                  <motion.img
                    key={`${selectedProject._id}-${currentImageIndex[selectedProject._id]}`}
                    src={`${selectedProject.images && selectedProject.images.length > 0 ? selectedProject.images[currentImageIndex[selectedProject._id] || 0] : "/placeholder.svg"}`}
                    alt={`${selectedProject.title} image ${currentImageIndex[selectedProject._id] + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                {selectedProject.images && selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageChange(selectedProject._id, "prev")}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-800/70 p-2 rounded-full hover:bg-slate-800"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-50" />
                    </button>
                    <button
                      onClick={() => handleImageChange(selectedProject._id, "next")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-800/70 p-2 rounded-full hover:bg-slate-800"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-50" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {(selectedProject.images || ["/placeholder.svg"]).map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2 h-2 rounded-full ${idx === (currentImageIndex[selectedProject._id] || 0) ? "bg-sky-500" : "bg-slate-600"}`}
                          onClick={() => setCurrentImageIndex(prev => ({ ...prev, [selectedProject._id]: idx }))}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <p className="text-slate-400 mb-4">{selectedProject.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedProject.techStack.map((tech) => (
                  <span key={tech} className="bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full text-xs">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 mb-4">
                {selectedProject.githubLink && (
                  <a
                    href={selectedProject.githubLink}
                    className="inline-flex items-center gap-2 text-sky-500 hover:text-purple-500 transition-colors"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {selectedProject.liveLink && (
                  <a
                    href={selectedProject.liveLink}
                    className="inline-flex items-center gap-2 text-sky-500 hover:text-purple-500 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-600">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">© 2025 Hassan Ahmad. Built with React, Framer Motion, and lots of ☕</p>
        </div>
      </footer>
    </div>
  )
}