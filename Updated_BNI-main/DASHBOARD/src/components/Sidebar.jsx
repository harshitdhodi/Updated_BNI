import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { LayoutDashboard, Users, Building2, Database, MessageSquare, ChevronUp, Menu, X } from 'lucide-react';
import logo from "../../public/logo.png";
const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState({});
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarData = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
      text: "Dashboard",
      submenu: [],
    },
    {
      title: "Customers",
      path: "/memberList",
      icon: <Users size={20} strokeWidth={1.5} />,
      text: "Members",
      submenu: [],
    },
    {
      title: "Company",
      path: "",
      icon: <Building2 size={20} strokeWidth={1.5} />,
      text: "Company",
      submenu: [
        {
          title: "Companies",
          path: "/company",
        },
        {
          title: "Departments",
          path: "/departmentList",
        },
      ],
    },
    // {
    //   title: "Business",
    //   path: "/business",
    //   icon: <Building2 size={20} strokeWidth={1.5} />,
    //   text: "Business",
    //   submenu: [
    //     {
    //       title: "Business",
    //       path: "/business",
    //     },
    //     {
    //       title: "Business Form",
    //       path: "/business_form",
    //     },
    //   ],
    // },
    {
      title: "Admin Master",
      path: "/master",
      icon: <Database size={20} strokeWidth={1.5} />,
      text: "Admin Master",
      submenu: [
        {
          title: "Countries",
          path: "/country",
        },
        {
          title: "Cities",
          path: "/cities",
        },
        {
          title: "Industry",
          path: "/industryList",
        },
      ],
    },
    
    {
      title: "Total Asks",
      path: "/allAsks",
      icon: <MessageSquare size={20} strokeWidth={1.5} />,
      text: "Total Asks",
      submenu: [],
    },
    {
      title: "Total Gives",
      path: "/allGives",
      icon: <MessageSquare size={20} strokeWidth={1.5} />,
      text: "Total Gives",
      submenu: [],
    },
    {
      title: "All Business",
      path: "/business",
      icon: <Building2 size={20} strokeWidth={1.5} />,
      text: "All Business",
      submenu: [],
    }
  ];

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSubMenu = (e, index) => {
    e.preventDefault();
    setIsSubMenuOpen((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleItemClick = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="relative flex">
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed lg:relative z-50 bg-white border-r border-gray-300 shadow-lg min-h-screen transition-transform duration-300 w-64 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-64 lg:translate-x-0"
        }`}
      >
   <div className="flex items-center justify-between h-16 px-6 border-b border-gray-300 lg:justify-center bg-gradient-to-r from-blue-50 to-white">
          <img src={logo} alt="B-CONN Logo" className=" w-auto object-contain" />
          <button onClick={toggleSidebar} className="lg:hidden text-gray-600 hover:text-blue-600 transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            {sidebarData.map((item, i) => (
              <div key={i}>
                {item.submenu.length > 0 ? (
                  <>
                    <button
                      onClick={(e) => toggleSubMenu(e, i)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 hover:text-blue-700">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                      <ChevronUp
                        size={16}
                        strokeWidth={1.5}
                        className={`transition-transform duration-300 ${
                          isSubMenuOpen[i] ? "rotate-0" : "rotate-180"
                        }`}
                      />
                    </button>

                    {isSubMenuOpen[i] && (
                      <ul className="mt-1 ml-2 space-y-1 border-l-2 border-blue-300 pl-3">
                        {item.submenu.map((subItem, j) => (
                          <li key={j}>
                            <Link
                              to={subItem.path}
                              className={`flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                                location.pathname === subItem.path
                                  ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
                                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                              }`}
                              onClick={() => handleItemClick(subItem.path)}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                    onClick={() => handleItemClick(item.path)}
                  >
                    <span className="text-blue-600">{item.icon}</span>
                    <span>{item.text}</span>
                  </Link>
                )}
              </div>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-col flex-1 h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
