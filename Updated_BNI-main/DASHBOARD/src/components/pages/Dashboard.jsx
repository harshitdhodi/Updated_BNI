'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaAddressBook, FaDatabase, FaUser } from "react-icons/fa";
import { FaFlag, FaTreeCity } from "react-icons/fa6";
import { TrendingUp } from 'lucide-react';
import PieChart from "./member/Piechart";

const Dashboard = () => {
  const [chapter, setChapter] = useState(0);
  const [city, setCity] = useState(0);
  const [country, setCountry] = useState(0);
  const [department, setDepartment] = useState(0);
  const [customer, setCustomer] = useState(0);
  const [asks, setAsks] = useState(0);
  const [gives, setGives] = useState(0);
  const [business, setBusiness] = useState(0);
  const [company, setCompany] = useState(0);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = getCookie("token");
        const TotalAsks = await axios.get("/api/myAsk/getTotalAsks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setAsks(TotalAsks.data.TotalMyAsks);

        const TotalGives = await axios.get("/api/myGives/totalGives", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setGives(TotalGives.data.total);

        const TotalCompany = await axios.get("/api/company/totalCompany", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setCompany(TotalCompany.data.TotalCompany);

        const TotalBusiness = await axios.get("/api/business/totalbusiness", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setBusiness(TotalBusiness.data.Totalbusiness);

        const TotalChapter = await axios.get("/api/chapter/totalchapter", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setChapter(TotalChapter.data.TotalChapters);

        const TotalCity = await axios.get("/api/city/totalCity", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setCity(TotalCity.data.TotalCitys);

        const TotalCountry = await axios.get("/api/country/totalCountry", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setCountry(TotalCountry.data.TotalCountries);

        const TotalDepartment = await axios.get(
          "/api/department/totalDepartment",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setDepartment(TotalDepartment.data.TotalDepartments);

        const TotalCustomer = await axios.get("/api/member/totalmember", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setCustomer(TotalCustomer.data.Totalmembers);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const StatCard = ({ icon: Icon, label, value, link, color }) => (
    <a
      href={link}
      className="group relative h-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200 p-6 flex flex-col justify-between"
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300 group-hover:h-1.5"
       
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg transition-transform duration-300 group-hover:scale-110 "
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <span className="text-sm font-medium text-slate-600">{label}</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <p className="text-3xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
          {value}
        </p>
      </div>

      
    </a>
  );

  const stats = [
    {
      label: "Total Asks",
      value: asks,
      link: "/allAsks",
      icon: FaAddressBook,
      color: "#3b82f6",
    },
    {
      label: "Total Gives",
      value: gives,
      link: "/allGives",
      icon: FaDatabase,
      color: "#8b5cf6",
    },
    {
      label: "Total Companies",
      value: company,
      link: "/company",
      icon: FaTreeCity,
      color: "#06b6d4",
    },
    {
      label: "Total Business",
      value: business,
      link: "/business",
      icon: FaTreeCity,
      color: "#ec4899",
    },
    {
      label: "Total Departments",
      value: department,
      link: "/departmentList",
      icon: FaAddressBook,
      color: "#f59e0b",
    },
    {
      label: "Total Members",
      value: customer,
      link: "/memberList",
      icon: FaUser,
      color: "#10b981",
    },
    {
      label: "Cities",
      value: city,
      link: "/cities",
      icon: FaTreeCity,
      color: "#6366f1",
    },
    {
      label: "Countries",
      value: country,
      link: "/country",
      icon: FaFlag,
      color: "#ef4444",
    },
  ];

  return (
    <>
      <div className="min-h-screen  p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-700 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Monitor and manage your business metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              link={stat.link}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-xl  overflow-hidden border border-slate-200">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Analytics Overview
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Detailed breakdown of your metrics
            </p>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex justify-center">
              <PieChart className="w-full max-w-2xl" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
