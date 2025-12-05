import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

function Navbar({ onMenuClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id: userId } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/member/getUserById?id=${userId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        
        const data = await response.json()
        setUserData(data.data)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching user data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  // Get user initials from name
  const getUserInitials = (name) => {
    if (!name) return 'U'
    const names = name.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Display name and email from API data or fallback
  const displayName = userData?.name || 'User'
  const displayRole = userData?.email || 'Member'
  const initials = getUserInitials(displayName)

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="px-4 lg:px-6  flex items-center justify-between">
        {/* Left Section - Menu Toggle & Brand */}
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
            <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
          </div>

          {/* Desktop brand */}
          <div className="hidden lg:flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          </div>
        </div>

        {/* Right Section - Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification Bell */}
          {/* <button className="relative text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button> */}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-r-lg transition-colors py-1"
            >
              <div className="hidden sm:flex flex-col items-end">
                {loading ? (
                  <>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                  </>
                ) : error ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">User</p>
                    <p className="text-xs text-gray-600">Error loading</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{displayRole}</p>
                  </>
                )}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {loading ? '...' : initials}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar