/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { easeOut } from 'motion/react';

export function FlipCard({ data }) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const isTouchDevice =
    typeof window !== 'undefined' && 'ontouchstart' in window;

  const handleClick = () => {
    if (isTouchDevice) setIsFlipped(!isFlipped);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) setIsFlipped(false);
  };

  const cardVariants = {
    front: { rotateY: 0, transition: { duration: 0.6, ease: easeOut } },
    back: { rotateY: 180, transition: { duration: 0.6, ease: easeOut } },
  };

  return (
    <div
      className="relative w-44 h-64 md:w-60 md:h-80 perspective-1000 cursor-pointer mx-auto group"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* FRONT SIDE */}
      <motion.div
        className="
          absolute inset-0 backface-hidden rounded-xl
          flex flex-col items-center justify-center text-center
          bg-gradient-to-br from-[#0f0f0f] via-[#161616] to-[#0b0b0b]
          border border-white/10
          shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]
          text-white
        "
        animate={isFlipped ? 'back' : 'front'}
        variants={cardVariants}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl" />
          <img
            src={data.avatar}
            alt={data.name}
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-white/20"
          />
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold tracking-wide">
          {data.name}
        </h3>

        {/* Role */}
        <p className="text-xs uppercase tracking-widest text-white/40 mt-1">
          {data.title}
        </p>

        {/* Hint */}
        <p className="absolute bottom-4 text-[10px] text-white/30">
          Hover to read review
        </p>
      </motion.div>

      {/* BACK SIDE */}
      <motion.div
        className="
          absolute inset-0 backface-hidden rounded-xl
          flex flex-col items-center justify-center px-5 text-center
          bg-gradient-to-br from-[#0c0c0c] via-[#141414] to-[#090909]
          border border-white/10
          shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]
          text-white
        "
        initial={{ rotateY: 180 }}
        animate={isFlipped ? 'front' : 'back'}
        variants={cardVariants}
        style={{ transformStyle: 'preserve-3d', rotateY: 180 }}
      >
        {/* Quote Icon */}
        <span className="text-4xl text-indigo-400/40 mb-3">“</span>

        {/* Testimonial */}
        <p className="text-sm md:text-base text-white/70 leading-relaxed">
          {data.testimonial}
        </p>

        {/* Stars */}
        <div className="flex gap-1 text-yellow-400 text-sm mt-4">
          ★ ★ ★ ★ ★
        </div>
      </motion.div>
    </div>
  );
}
