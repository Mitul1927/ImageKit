"use client";
import Link from "next/link";
import Header from "./components/Header";
import { useState, useEffect } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: "🎥",
      title: "Video Management",
      description: "Upload, store, and manage your video content with ease",
    },
    {
      icon: "🖼️",
      title: "Image Processing",
      description: "Transform and optimize images on-the-fly with ImageKit",
    },
    {
      icon: "🔐",
      title: "Secure Authentication",
      description: "User registration and secure login with NextAuth.js",
    },
    {
      icon: "⚡",
      title: "Real-time Upload",
      description: "Progress tracking and instant file processing",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* <Header /> */}

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Main Hero Content */}
          <div
            className={`text-center transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MediaFlow
              </span>
              <br />
              <span className="text-gray-700">Pro</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A powerful media management platform built with Next.js and
              ImageKit. Upload, transform, and deliver your images and videos
              with lightning-fast performance.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                    currentFeature === index
                      ? "ring-2 ring-blue-500 shadow-blue-200"
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/upload-test"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">Try Upload Demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                href="/login"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Technology Stack */}
          <div
            className={`mt-20 transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Built with Modern Technology
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: "Next.js 15", logo: "⚡", desc: "React Framework" },
                { name: "ImageKit", logo: "🖼️", desc: "Media CDN" },
                { name: "NextAuth", logo: "🔐", desc: "Authentication" },
                { name: "MongoDB", logo: "🍃", desc: "Database" },
              ].map((tech, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-110 transition-transform duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-5xl mb-4 group-hover:animate-bounce">
                    {tech.logo}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {tech.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div
            className={`mt-20 transition-all duration-1000 delay-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                What This Platform Does
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Media Upload & Storage
                      </h3>
                      <p className="text-gray-600">
                        Upload images and videos with real-time progress
                        tracking. Files are securely stored and optimized using
                        ImageKit&apos;s CDN.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Dynamic Transformations
                      </h3>
                      <p className="text-gray-600">
                        Automatically resize, compress, and optimize media for
                        different devices and use cases without storing multiple
                        versions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        User Management
                      </h3>
                      <p className="text-gray-600">
                        Secure user registration and authentication system with
                        session management and profile handling.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        API Integration
                      </h3>
                      <p className="text-gray-600">
                        RESTful API endpoints for video management, CRUD
                        operations, and seamless frontend-backend communication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-gray-400 mb-6">
              Join thousands of developers using ImageKit for their media needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Create Account
              </Link>
              <Link
                href="/upload-test"
                className="px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-gray-500 hover:text-white transition-colors duration-300"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
