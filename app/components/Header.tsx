"use client";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTierBadge = (tier: string | undefined) => {
    if (!tier) tier = "free";
    const colors = {
      free: "bg-gray-200 text-gray-800",
      pro: "bg-yellow-100 text-yellow-800",
    };
    const icons = {
      free: "★", 
      pro: "🌟",
    };
    return (
      <span
        className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[tier as keyof typeof colors]}`}
      >
        {icons[tier as keyof typeof icons]} {tier.toUpperCase()}
      </span>
    );
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MF</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 whitespace-normal">
              MediaFlow Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {status === "authenticated" ? (
              <>
                <Link href="/upload" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105">
                  Upload
                </Link>
                <Link href="/files" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105">
                  My Files
                </Link>
              </>
            ) : (
              <>
                <Link href="/upload-test" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105">
                  Upload Demo
                </Link>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105">
                  Login
                </Link>
                <Link href="/register" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105">
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {status === "authenticated" ? (
              <div className="flex items-center space-x-3">
                {/* User Avatar & Info */}
                <div className="hidden sm:flex items-center space-x-3">
                  {user?.image && (
                    <Image
                      src={user.image}
                      alt={user.name || user.email || "User"}
                      width={36}
                      height={36}
                      className="rounded-full ring-2 ring-blue-100 hover:ring-blue-300 transition-all duration-300"
                    />
                  )}
                  <div className="flex items-center text-sm">
                    <div className="font-medium text-gray-900">
                      {user?.name || user?.email?.split("@")[0]}
                    </div>
                    {getTierBadge(user?.tier)}
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              {status === "authenticated" ? (
                <>
                  <Link href="/upload" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>
                    Upload
                  </Link>
                  <Link href="/files" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>
                    My Files
                  </Link>
                  <Link href="/upload-test" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>
                    Test Upload
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/upload-test" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>
                    Upload Demo
                  </Link>
                  <Link href="/login" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}

              {status === "authenticated" && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    {user?.image && (
                      <Image src={user.image} alt={user.name || user.email || "User"} width={32} height={32} className="rounded-full" />
                    )}
                    <div className="text-sm flex items-center">
                      <div className="font-medium text-gray-900">{user?.name || user?.email?.split("@")[0]}</div>
                      {getTierBadge(user?.tier)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
