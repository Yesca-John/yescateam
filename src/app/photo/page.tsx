'use client';

import React from 'react';
import { Instagram, Youtube, Clock, ArrowRight } from 'lucide-react';

const PhotoPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-500">
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-br from-red-400 via-pink-400 to-purple-400 rounded-sm animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Diagonal Light Rays */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 via-transparent to-transparent opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_0%,transparent_50%)]"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Logo Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-white font-bold text-2xl md:text-3xl drop-shadow-lg">
            YESCA
            <div className="text-base font-normal">2026</div>
          </div>
        </div>

        {/* Main Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] mb-4 tracking-tight leading-none" style={{
            textShadow: '0 4px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(255,200,0,0.4)'
          }}>
            PHOTO
          </h1>
          
          {/* Countdown Box */}
          <div className="inline-block bg-white/95 backdrop-blur-sm rounded-3xl px-8 py-6 mb-6 shadow-2xl">
            <div className="flex items-center gap-3 justify-center mb-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <p className="text-2xl font-bold text-gray-800">Available In</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white px-12 py-6 rounded-2xl shadow-lg">
              <div className="text-6xl font-black">1</div>
              <div className="text-xl font-bold tracking-widest mt-1">DAY</div>
            </div>
          </div>

          {/* URL Section */}
        </div>

        {/* Social Media Section - Compact Grid */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* YouTube CBA */}
          <a
            href="https://www.youtube.com/@ChristianBrethrenAssemblies"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">YouTube</p>
                  <p className="text-xs text-gray-600">CBA Channel</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 truncate">@ChristianBrethrenAssemblies</p>
            </div>
          </a>

          {/* Instagram CBA */}
          <a
            href="https://www.instagram.com/cba.india"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">Instagram</p>
                  <p className="text-xs text-gray-600">CBA India</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">@cba.india</p>
            </div>
          </a>

          {/* Instagram YESCA */}
          <a
            href="https://www.instagram.com/yesca_team"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">Instagram</p>
                  <p className="text-xs text-gray-600">YESCA Team</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">@yesca_team</p>
            </div>
          </a>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-white text-lg font-semibold drop-shadow-lg">
            📸 Stay tuned for amazing memories!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PhotoPage;
