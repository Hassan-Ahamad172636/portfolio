'use client';
import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Particles } from "@/components/ui/shadcn-io/particles";

/* =======================
   ELEGANT FLOATING SHAPE
======================= */
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 120,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -120, rotate: rotate - 10 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.2,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
      }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient}
          backdrop-blur-[3px] border border-white/10 shadow-[0_8px_40px_rgba(255,255,255,0.08)]`}
        />
      </motion.div>
    </motion.div>
  );
}

export default function ContactPage() {
  return (
    <section id="contact" className="relative min-h-screen w-full bg-[#030303] overflow-hidden flex items-center justify-center px-6 py-20">

      <Particles className="absolute inset-0" quantity={100} ease={80} color="#ffffff" refresh />


      {/* 🔮 Floating Shapes */}
      <ElegantShape
        className="left-[-12%] top-[12%]"
        width={620}
        height={160}
        rotate={12}
        gradient="from-indigo-500/[0.18]"
        delay={0.3}
      />
      <ElegantShape
        className="right-[-8%] top-[55%]"
        width={520}
        height={140}
        rotate={-14}
        gradient="from-rose-500/[0.16]"
        delay={0.5}
      />
      <ElegantShape
        className="left-[18%] bottom-[8%]"
        width={300}
        height={90}
        rotate={-8}
        gradient="from-violet-500/[0.16]"
        delay={0.6}
      />

      {/* CONTACT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-10
        rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10
        shadow-2xl shadow-black/60 p-8 md:p-12"
      >
        {/* LEFT INFO */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Let’s Work Together
            </h1>
            <p className="mt-4 text-white/60 max-w-md">
              Have an idea, a project, or just want to say hello?
              I’d love to hear from you.
            </p>
          </div>

          <div className="space-y-5 text-white/80">
            <div className="flex items-center gap-4">
              <Mail className="text-indigo-400" />
              <span>hassan.dev@email.com</span>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-indigo-400" />
              <span>+92 3XX XXX XXXX</span>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="text-indigo-400" />
              <span>Pakistan (Remote Friendly)</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <motion.form
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="space-y-6"
        >
          <div>
            <label className="text-sm text-white/60">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="mt-2 w-full rounded-xl bg-black/40 border border-white/10
              px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-white/60">Email Address</label>
            <input
              type="email"
              placeholder="john@email.com"
              className="mt-2 w-full rounded-xl bg-black/40 border border-white/10
              px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-white/60">Message</label>
            <textarea
              rows={5}
              placeholder="Tell me about your project..."
              className="mt-2 w-full rounded-xl bg-black/40 border border-white/10
              px-4 py-3 text-white outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700
            text-white font-medium py-3 transition"
          >
            Send Message 🚀
          </button>
        </motion.form>
      </motion.div>

      {/* FADE */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80" />
    </section>
  );
}
