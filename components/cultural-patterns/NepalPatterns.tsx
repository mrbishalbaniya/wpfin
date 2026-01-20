import React from 'react'

// Dhaka Topi Pattern SVG
export const DhakaPattern = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dhaka-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        {/* Traditional Dhaka geometric pattern */}
        <rect width="20" height="20" fill="transparent"/>
        <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="currentColor" opacity="0.3"/>
        <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.5"/>
        <path d="M5,5 L15,5 M5,15 L15,15 M5,10 L15,10" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dhaka-pattern)"/>
  </svg>
)

// Himalayan Silhouette
export const HimalayanSilhouette = () => (
  <svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M0,100 L0,60 L50,40 L80,20 L120,35 L160,15 L200,25 L240,10 L280,20 L320,30 L360,45 L400,35 L400,100 Z" 
      fill="currentColor" 
      opacity="0.1"
    />
    <path 
      d="M0,100 L0,70 L40,50 L70,30 L100,45 L140,25 L180,35 L220,20 L260,30 L300,40 L340,55 L400,45 L400,100 Z" 
      fill="currentColor" 
      opacity="0.15"
    />
  </svg>
)

// Pagoda Temple Silhouette
export const PagodaSilhouette = () => (
  <svg width="80" height="100" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    {/* Base */}
    <rect x="30" y="85" width="20" height="15" fill="currentColor" opacity="0.2"/>
    {/* First tier */}
    <path d="M10,80 L70,80 L65,75 L15,75 Z" fill="currentColor" opacity="0.25"/>
    <rect x="32" y="70" width="16" height="10" fill="currentColor" opacity="0.2"/>
    {/* Second tier */}
    <path d="M15,65 L65,65 L60,60 L20,60 Z" fill="currentColor" opacity="0.3"/>
    <rect x="34" y="55" width="12" height="10" fill="currentColor" opacity="0.25"/>
    {/* Third tier */}
    <path d="M20,50 L60,50 L55,45 L25,45 Z" fill="currentColor" opacity="0.35"/>
    <rect x="36" y="40" width="8" height="10" fill="currentColor" opacity="0.3"/>
    {/* Spire */}
    <path d="M38,40 L42,40 L40,20 Z" fill="currentColor" opacity="0.4"/>
    <circle cx="40" cy="20" r="2" fill="currentColor" opacity="0.5"/>
  </svg>
)

// Buddha Eyes (Wisdom Eyes)
export const BuddhEyes = () => (
  <svg width="60" height="30" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    {/* Left eye */}
    <ellipse cx="15" cy="15" rx="12" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="15" cy="15" r="4" fill="currentColor" opacity="0.7"/>
    <circle cx="16" cy="14" r="1.5" fill="white" opacity="0.9"/>
    
    {/* Right eye */}
    <ellipse cx="45" cy="15" rx="12" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="45" cy="15" r="4" fill="currentColor" opacity="0.7"/>
    <circle cx="46" cy="14" r="1.5" fill="white" opacity="0.9"/>
    
    {/* Nose (Nepali number 1) */}
    <path d="M28,20 Q30,25 32,20" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
  </svg>
)

// Khukuri (Traditional Nepali Knife)
export const KhukuriIcon = () => (
  <svg width="40" height="60" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    {/* Handle */}
    <rect x="16" y="45" width="8" height="12" rx="2" fill="currentColor" opacity="0.4"/>
    <rect x="17" y="46" width="6" height="10" fill="currentColor" opacity="0.3"/>
    
    {/* Guard */}
    <ellipse cx="20" cy="43" rx="6" ry="2" fill="currentColor" opacity="0.5"/>
    
    {/* Blade */}
    <path d="M18,43 L18,15 Q18,10 22,8 Q25,10 25,15 L22,43 Z" fill="currentColor" opacity="0.6"/>
    <path d="M22,8 Q20,5 18,8 Q20,6 22,8" fill="currentColor" opacity="0.7"/>
    
    {/* Notch (characteristic of Khukuri) */}
    <path d="M18,35 Q16,33 18,31" fill="none" stroke="white" strokeWidth="1" opacity="0.8"/>
  </svg>
)

// Newari Window Pattern
export const NewariWindow = () => (
  <svg width="80" height="100" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    {/* Outer frame */}
    <rect x="5" y="10" width="70" height="80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
    
    {/* Inner decorative elements */}
    <rect x="10" y="15" width="60" height="70" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    
    {/* Traditional carved patterns */}
    <circle cx="40" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    <path d="M25,50 Q40,40 55,50 Q40,60 25,50" fill="currentColor" opacity="0.2"/>
    
    {/* Geometric patterns */}
    <path d="M15,70 L25,60 L35,70 L45,60 L55,70 L65,60" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
  </svg>
)

// Copper/Brass Texture Pattern
export const CopperTexture = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="copper-noise">
        <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/>
        <feGaussianBlur stdDeviation="0.5"/>
      </filter>
      <radialGradient id="copper-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#CD7F32" stopOpacity="0.8"/>
        <stop offset="30%" stopColor="#B87333" stopOpacity="0.6"/>
        <stop offset="60%" stopColor="#A0522D" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="#8B4513" stopOpacity="0.2"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#copper-gradient)" filter="url(#copper-noise)"/>
    
    {/* Hammered metal effect */}
    <circle cx="50" cy="50" r="15" fill="#CD7F32" opacity="0.1"/>
    <circle cx="150" cy="80" r="12" fill="#B87333" opacity="0.1"/>
    <circle cx="80" cy="150" r="18" fill="#A0522D" opacity="0.1"/>
    <circle cx="170" cy="170" r="10" fill="#CD7F32" opacity="0.1"/>
    <circle cx="30" cy="120" r="14" fill="#B87333" opacity="0.1"/>
  </svg>
)

export const NepalPatterns = {
  DhakaPattern,
  HimalayanSilhouette,
  PagodaSilhouette,
  BuddhEyes,
  KhukuriIcon,
  NewariWindow,
  CopperTexture
}