import React from 'react'
import { motion } from 'framer-motion'

// Enhanced Dhaka Pattern with Animation
export const AnimatedDhakaPattern = ({ mouseX, mouseY }: { mouseX: any, mouseY: any }) => (
  <motion.div
    style={{ x: mouseX, y: mouseY }}
    className="absolute inset-0"
  >
    <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="animated-dhaka-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="transparent"/>
          <motion.path 
            d="M0,20 L20,0 L40,20 L20,40 Z" 
            fill="currentColor" 
            opacity="0.3"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.circle 
            cx="20" 
            cy="20" 
            r="6" 
            fill="currentColor" 
            opacity="0.5"
            animate={{ 
              r: [5, 7, 5],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <motion.g
            animate={{ 
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
          >
            <path d="M10,10 L30,10 M10,30 L30,30 M10,20 L30,20" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
          </motion.g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#animated-dhaka-pattern)"/>
    </svg>
  </motion.div>
)

// Animated Himalayan Silhouette with Parallax
export const AnimatedHimalayanSilhouette = ({ mouseX, mouseY }: { mouseX: any, mouseY: any }) => (
  <motion.div
    style={{ 
      x: mouseX,
      y: mouseY,
      scale: 1.02
    }}
    className="absolute bottom-0 left-0 right-0"
  >
    <svg width="100%" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
      <motion.path 
        d="M0,100 L0,60 L50,40 L80,20 L120,35 L160,15 L200,25 L240,10 L280,20 L320,30 L360,45 L400,35 L400,100 Z" 
        fill="currentColor" 
        opacity="0.1"
        animate={{ 
          opacity: [0.08, 0.15, 0.08]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.path 
        d="M0,100 L0,70 L40,50 L70,30 L100,45 L140,25 L180,35 L220,20 L260,30 L300,40 L340,55 L400,45 L400,100 Z" 
        fill="currentColor" 
        opacity="0.15"
        animate={{ 
          opacity: [0.12, 0.2, 0.12]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      />
    </svg>
  </motion.div>
)

// Animated Buddha Eyes with Subtle Movement
export const AnimatedBuddhEyes = ({ mouseX }: { mouseX: any }) => (
  <motion.div
    style={{ x: mouseX }}
    className="absolute top-2 right-2"
  >
    <svg width="60" height="30" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
      {/* Left eye */}
      <motion.ellipse 
        cx="15" 
        cy="15" 
        rx="12" 
        ry="8" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        opacity="0.6"
        animate={{ 
          strokeWidth: [1.5, 2, 1.5]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.circle 
        cx="15" 
        cy="15" 
        r="4" 
        fill="currentColor" 
        opacity="0.7"
        animate={{ 
          r: [3.5, 4.5, 3.5]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.circle 
        cx="16" 
        cy="14" 
        r="1.5" 
        fill="white" 
        opacity="0.9"
        animate={{ 
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Right eye */}
      <motion.ellipse 
        cx="45" 
        cy="15" 
        rx="12" 
        ry="8" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        opacity="0.6"
        animate={{ 
          strokeWidth: [1.5, 2, 1.5]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.circle 
        cx="45" 
        cy="15" 
        r="4" 
        fill="currentColor" 
        opacity="0.7"
        animate={{ 
          r: [3.5, 4.5, 3.5]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.circle 
        cx="46" 
        cy="14" 
        r="1.5" 
        fill="white" 
        opacity="0.9"
        animate={{ 
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Nose (Nepali number 1) */}
      <motion.path 
        d="M28,20 Q30,25 32,20" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none" 
        opacity="0.6"
        animate={{ 
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ 
          duration: 3.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      />
    </svg>
  </motion.div>
)

// Animated Copper Texture with Shimmer Effect
export const AnimatedCopperTexture = ({ mouseScale }: { mouseScale: any }) => (
  <motion.div
    style={{ scale: mouseScale }}
    className="absolute inset-0"
  >
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="animated-copper-noise">
          <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/>
          <feGaussianBlur stdDeviation="0.5"/>
        </filter>
        <radialGradient id="animated-copper-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CD7F32" stopOpacity="0.8"/>
          <stop offset="30%" stopColor="#B87333" stopOpacity="0.6"/>
          <stop offset="60%" stopColor="#A0522D" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#8B4513" stopOpacity="0.2"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#animated-copper-gradient)" filter="url(#animated-copper-noise)"/>
      
      {/* Animated hammered metal effect */}
      <motion.circle 
        cx="50" 
        cy="50" 
        r="15" 
        fill="#CD7F32" 
        opacity="0.1"
        animate={{ 
          r: [12, 18, 12],
          opacity: [0.08, 0.15, 0.08]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.circle 
        cx="150" 
        cy="80" 
        r="12" 
        fill="#B87333" 
        opacity="0.1"
        animate={{ 
          r: [10, 15, 10],
          opacity: [0.08, 0.12, 0.08]
        }}
        transition={{ 
          duration: 3.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.circle 
        cx="80" 
        cy="150" 
        r="18" 
        fill="#A0522D" 
        opacity="0.1"
        animate={{ 
          r: [15, 22, 15],
          opacity: [0.08, 0.15, 0.08]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
      />
    </svg>
  </motion.div>
)

export const AnimatedNepalPatterns = {
  AnimatedDhakaPattern,
  AnimatedHimalayanSilhouette,
  AnimatedBuddhEyes,
  AnimatedCopperTexture
}