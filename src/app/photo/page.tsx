'use client';

import React, { useState } from 'react';
import { Instagram, Youtube, Clock, ArrowRight, Download, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';

const PhotoPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const photos = [
    { src: '/images/YC26Boys2.png', title: 'YC26 Boys', downloadName: 'YC26_Boys.png' },
    { src: '/images/YC26GIRLS.png', title: 'YC26 Girls', downloadName: 'YC26_Girls.png' },
  ];

  const handleDownload = async (imageSrc: string, filename: string) => {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

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
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] mb-6 tracking-tight leading-none" style={{
            textShadow: '0 4px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(255,200,0,0.4)'
          }}>
            PHOTO GALLERY
          </h1>
          
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xl font-bold text-gray-800">Now Available!</span>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="space-y-8 mb-8">
          {photos.map((photo, index) => (
            <div key={index} className="group relative">
              <div 
                className="relative w-full rounded-2xl overflow-hidden bg-gray-900/20 cursor-pointer shadow-2xl"
                onClick={() => setSelectedImage(photo.src)}
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  width={2000}
                  height={800}
                  className="w-full h-auto hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <div className="bg-white/90 text-gray-800 p-5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none">
                    <ZoomIn className="w-7 h-7" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{photo.title}</h3>
                <button
                  onClick={() => handleDownload(photo.src, photo.downloadName)}
                  className="flex items-center gap-2 bg-white/95 hover:bg-white text-orange-600 px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all backdrop-blur-sm"
                >
                  <Download className="w-6 h-6" />
                  <span className="font-bold text-lg">Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Share Link Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-xl">
            <p className="text-gray-700 text-lg font-semibold mb-2">Share this page:</p>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-700 to-red-700 text-white px-8 py-3 rounded-full shadow-lg">
              <ArrowRight className="w-6 h-6" />
              <span className="text-2xl font-black tracking-wide">YC26.IN/PIC</span>
            </div>
          </div>
        </div>

        {/* Social Media Section - Compact Grid */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-6">
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
        <div className="text-center mt-6">
          <p className="text-white text-lg font-semibold drop-shadow-lg">
            📸 Download and share these amazing memories!
          </p>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const photo = photos.find(p => p.src === selectedImage);
              if (photo) handleDownload(photo.src, photo.downloadName);
            }}
            className="absolute top-4 right-20 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
            aria-label="Download"
          >
            <Download className="w-6 h-6" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={selectedImage}
              alt="Full size preview"
              fill
              className="object-contain"
              unoptimized
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

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
