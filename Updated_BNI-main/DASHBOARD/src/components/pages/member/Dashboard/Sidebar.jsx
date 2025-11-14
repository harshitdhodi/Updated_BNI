import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [expandedMenus, setExpandedMenus] = useState({ dashboard: true })
  const { id } = useParams(); // Get the member ID from the URL
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMenu = (id) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const menuData = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "dashboard",
      icon: "📊",
      subItems: [],
    },
    { id: "calendar", label: "Calendar", path: "calendar", icon: "📅", subItems: [] },
    { id: "profile", label: "User Profile", path: "user-profile", icon: "👤", subItems: [] },
    { id: "My Asks", label: "My Asks", path: "my-asks", icon: "📝", subItems: [] },
    { id: "My Gives", label: "My Gives", path: "my-gives", icon: "📋", subItems: [] },
    { id: "My Matches", label: "My Matches", path: "my-matches", icon: "📄", subItems: [] },
  ]

 

  // logout handler
  const handleLogout = async (e) => {
    e.preventDefault();
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/user/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.ok) {
        // Optionally close sidebar on mobile
        if (onClose) onClose();
        navigate("/login");
      } else {
        console.error("Logout failed", res.status);
      }
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar - Fixed height with internal scroll */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Branding - Fixed at top */}
        <div className="p-6 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              T
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">TailAdmin</h1>
              <p className="text-xs text-gray-500">Premium Dashboard</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable menu content */}
        <div className="flex-1 overflow-y-auto">
          {/* Menu Section */}
          <div className="px-4 py-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-4">MENU</p>

            {menuData.map((item) => (
              <div key={item.id} >
                <Link to={item.path ? `/member/${id}/${item.path}` : "#"}>
                  <button
                    onClick={() => {
                      setActiveMenu(item.id)
                      if (item.subItems.length > 0) {
                        toggleMenu(item.id)
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
                      activeMenu === item.id
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {item.subItems.length > 0 && (
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedMenus[item.id] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </Link>

                {/* Submenu Items */}
                {item.subItems.length > 0 && expandedMenus[item.id] && (
                  <div className="ml-8 pl-3 border-l-2 border-blue-200 space-y-1 mb-2 mt-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200  flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-200 to-red-400 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg p-4 text-center"
            disabled={isLoggingOut}
          >
            <p className="text-md font-semibold text-black mb-1">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </p>
          </button>
        </div>

      </aside>
    </>
  )
}
export default Sidebar