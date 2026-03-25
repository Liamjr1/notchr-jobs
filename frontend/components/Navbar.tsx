'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Briefcase, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage on mount
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      const { setAuth } = useAuthStore.getState();
      setAuth(JSON.parse(savedUser), token);
    } else {
      useAuthStore.getState().setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsDropdownOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              NotcHR <span className="text-blue-600">Jobs</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/jobs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Browse Jobs
            </Link>
            <Link href="/companies" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Companies
            </Link>
            {isAuthenticated && user?.role === 'employer' && (
              <Link href="/post-job" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Post a Job
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{user.firstName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            <Link href="/jobs" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsOpen(false)}>
              Browse Jobs
            </Link>
            <Link href="/companies" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsOpen(false)}>
              Companies
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Link href="/login" className="btn-secondary flex-1 justify-center" onClick={() => setIsOpen(false)}>
                  Log in
                </Link>
                <Link href="/register" className="btn-primary flex-1 justify-center" onClick={() => setIsOpen(false)}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}