import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, Outlet, useNavigate } from "react-router-dom";
import { GrChapterAdd } from "react-icons/gr";
import Navbar from "./Navbar";
import { FaHome, FaAddressBook, FaDatabase, FaUser } from "react-icons/fa";
import { GoTriangleUp } from "react-icons/go";
import { FaTreeCity } from "react-icons/fa6"; // Corrected import to FaTreeCity

const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarData = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
      text: "Dashboard",
      submenu: [],
    },
    {
      title: "Customer",
      path: "/memberList",
      icon: <FaUser />,
      text: "Members",
      submenu: [],
    },
    
    {
      title: "Company",
      path: "",
      icon: <FaAddressBook />,
      text: "Company",
      submenu: [
        {
          title: "Departments",
          path: "/departmentList",
        },
        {
          title: "Company",
          path: "/company",
        },
      ],
    },
   
    {
      title: "Admin Master",
      path: "/master",
      icon: <FaDatabase />,
      text: "AdminMaster",
      submenu: [
        {
          title: "Countries",
          path: "/country",
        },
        {
          title: "Cities",
          path: "/cities",
        },
        // {
        //   title: "Chapter",
        //   path: "/ChapterList",
        //   icon: <GrChapterAdd />,
        //   text: "Chapters",
        //   submenu: [],
        // },
        {
          title: "Industry ",
          path: "/industryList",
          icon: <FaAddressBook />,
          text: "Industry",
          submenu: [],
        },
      ],
    },
    {
      title: "My Business",
      path: "/business",
      icon: <FaAddressBook />,
      text: "MyBusiness",
      submenu: [],
    },
   
    {
      title: "Total Asks",
      path: "/allAsks",
      icon: <FaAddressBook />,
      text: "Total Asks",
      submenu: [],
    },
    {
      title: "Total Gives",
      path: "/allGives",
      icon: <FaAddressBook />,
      text: "Total Gives",
      submenu: [],
    },
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
    setIsMenuOpen(false); // Close sidebar
    navigate(path); // Navigate to the selected path
  };

  return (
    <div className="relative flex " >
      {/* Overlay for closing sidebar */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`bg-[#CF2030] m-3 shadow-red-300 shadow-md rounded-md min-h-[85vh] fixed lg:relative z-50 transition-transform duration-500 ${
          isMenuOpen
            ? "translate-x-0 min-h-[95%] m-5 "
            : "min-h-[95%] -translate-x-80  lg:translate-x-0"
        } ${isSidebarCollapsed ? "lg:w-16" : "lg:w-52"} w-52`}
      >
        <div className="flex justify-between items-center px-4 py-3 bg-gray-200 lg:hidden">
          <div className="font-bold w-full text-white mt-2 text-xl flex justify-center items-center">
            <span className="text-[40px] font-BNiFont">B-CONN</span>{" "}
            {/* Apply custom font here */}
          </div>
          <button onClick={toggleSidebar} className="text-white">
            {/* <IoIosArrowDown className={`transition-transform duration-500 ${isSidebarCollapsed ? "transform rotate-180" : ""}`} /> */}
          </button>
        </div>
        <div
          className="font-bold text-white text-center pt-4 text-2xl lg:block hidden cursor-pointer"
          // onClick={toggleSidebarCollapse}
        >
          <span className="text-[40px] font-BNiFont">B-CONN</span>{" "}
          {/* Apply custom font here */}
        </div>
        <div className="mt-4">
          <ul className="p-3">
            {sidebarData.map((item, i) => (
              <div key={i} style={{ marginTop: item.title === "Admin Master" ? "1px" : "0" }}>
                {item.submenu.length > 0 ? (
                  <>
                    {/* Add arrow icon for Master dropdown */}
                    <div
                      className={`flex items-center gap-2 hover:bg-red-200 py-2 rounded-md pl-4 pr-16 hover:cursor-pointer ${
                        location.pathname === item.path ? "bg-red-300" : ""
                      }`}
                      onClick={(e) => toggleSubMenu(e, i)}
                    >
                      <p className="text-white">{item.icon}</p>
                      {!isSidebarCollapsed && (
                        <p className="text-white font-semibold">
                          {isSidebarCollapsed ? "" : item.text}
                        </p>
                      )}
                      <span className="ml-auto">
                        {isSubMenuOpen[i] ? (
                          <GoTriangleUp className="text-white" /> // Up arrow when submenu is open
                        ) : (
                          <GoTriangleUp className="text-white transform rotate-180" /> // Down arrow when submenu is closed
                        )}
                      </span>
                    </div>
                    {isSubMenuOpen[i] && (
                      <ul>
                        {item.submenu.map((subItem, j) => (
                          <Link
                            key={j}
                            to={subItem.path}
                            className={`flex items-center gap-2 hover:bg-red-200 py-2 rounded-md pl-4 pr-16 hover:cursor-pointer ${
                              location.pathname === subItem.path
                                ? "bg-red-300"
                                : ""
                            }`}
                            onClick={() => handleItemClick(subItem.path)}
                          >
                            {!isSidebarCollapsed && (
                              <p className="text-white">{subItem.title}</p>
                            )}
                          </Link>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 hover:bg-red-200 py-2 rounded-md pl-4 pr-16 hover:cursor-pointer ${
                      location.pathname === item.path ? "bg-red-300" : ""
                    }`}
                    onClick={() => handleItemClick(item.path)}
                  >
                    <p className="text-white">{item.icon}</p>
                    {!isSidebarCollapsed && (
                      <p className="text-white font-semibold">
                        {isSidebarCollapsed ? "" : item.text}
                      </p>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex flex-col h-screen w-full bg-gray-200">
        <Navbar className="fixed w-full bg-gray-200 z-50" toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
