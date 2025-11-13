"use client"

import { useState } from "react"

function Navbar({ onMenuClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* Left Section - Menu Toggle & Brand (Mobile) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="text-gray-500 lg:hidden block hover:text-gray-700 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-bold text-gray-900">TailAdmin</span>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2.5 w-full transition-colors duration-200 border border-gray-200">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search or type command..."
              className="bg-transparent ml-3 outline-none text-sm text-gray-700 flex-1 placeholder-gray-400"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section - Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search icon for mobile */}
          <button className="md:hidden text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Theme Toggle */}
          <button className="hidden sm:block text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 015.646 5.646 9.001 9.001 0 0020.354 15.354z"
              />
            </svg>
          </button>

          {/* Notification Bell */}
          <button className="relative text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-r-lg transition-colors py-1"
            >
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-medium text-gray-900">Musharof</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                M
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Settings
                </a>
                <hr className="my-1 border-gray-200" />
                <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar