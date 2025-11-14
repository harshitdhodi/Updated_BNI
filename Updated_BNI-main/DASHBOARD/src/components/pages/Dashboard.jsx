import React, { useEffect, useState } from "react";
import axios from "axios";
import { GrChapterAdd } from "react-icons/gr";
import { FaAddressBook, FaDatabase, FaUser } from "react-icons/fa";
import { FaFlag, FaTreeCity } from "react-icons/fa6";
import PieChart from "./member/Piechart";
import { Link } from 'react-router-dom';
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

        const TotalDepartment = await axios.get("/api/department/totalDepartment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
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

  return (
    <>
      <div className="gap-3 mx-4 my-5 grid place-items-center lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-3 mr-6">
      <Link to="/allAsks" className="lg:w-full w-[80%] h-[150px] bg-white shadow-red-300 shadow-md rounded-md flex flex-col items-center justify-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-black font-bold text-xl"><FaAddressBook /></span>
          <p className="text-black font-bold text-lg">Total Asks</p>
        </div>
        <span className="font-bold border-2 text-xl p-1 px-4 rounded-md mt-2 shadow-red-300 shadow-md bg-white text-black">{asks}</span>
      </Link>

      <Link to="/allGives" className="lg:w-full w-[80%] h-[150px] bg-white shadow-red-300 shadow-md rounded-md flex flex-col items-center justify-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-black font-bold text-xl"><FaDatabase /></span>
          <p className="text-black font-bold text-lg">Total Gives</p>
        </div>
        <span className="font-bold border-2 text-xl p-1 px-4 rounded-md mt-2 shadow-red-300 shadow-md bg-white text-black">{gives}</span>
      </Link>

      <Link to="/company" className="lg:w-full w-[80%] h-[150px] bg-white shadow-red-300 shadow-md rounded-md flex flex-col items-center justify-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-black font-bold text-xl"><FaTreeCity /></span>
          <p className="text-black font-bold text-lg">Total Companies</p>
        </div>
        <span className="font-bold border-2 text-xl p-1 px-4 rounded-md mt-2 shadow-red-300 shadow-md bg-white text-black">{company}</span>
      </Link>

      <Link to="/business" className="lg:w-full w-[80%] h-[150px] bg-white shadow-red-300 shadow-md rounded-md flex flex-col items-center justify-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-black font-bold text-xl"><FaTreeCity /></span>
          <p className="text-black font-bold text-lg">Total Business</p>
        </div>
        <span className="font-bold border-2 text-xl p-1 px-4 rounded-md mt-2 shadow-red-300 shadow-md bg-white text-black">{business}</span>
      </Link>

      <Link to="/departmentList" className="lg:w-full w-[80%] h-[150px] bg-white shadow-red-300 shadow-md rounded-md flex flex-col items-center justify-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-black font-bold text-xl"><FaAddressBook /></span>
          <p className="text-black font-bold text-lg">Total Department</p>
        </div>
        <span className="font-bold border-2 text-xl p-1 px-4 rounded-md mt-2 shadow-red-300 shadow-md bg-white text-black">{department}</span>
      </Link>

      <Link to="/memberList" className="lg:w-full w-[80%] h-[150px] bg-white shadow-red-300 shadow-md rounded-md flex flex-col items-center justify-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-black font-bold text-lg"><FaUser /></span>
          <p className="text-black font-bold text-lg">Total Member</p>
        </div>
        <span className="font-bold border-2 text-xl p-1 px-4 rounded-md mt-2 shadow-red-300 shadow-md bg-white text-black">{customer}</span>
      </Link>

      <Link to="/cities" className="lg:w-full w-[80%] h-[150px] bg-white shadow-red-300 shadow-md rounded-md flex flex-col items-center justify-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-black font-bold text-xl"><FaTreeCity /></span>
          <p className="text-black font-bold text-lg">Cities</p>
        </div>
        <span className="font-bold border-2 text-xl p-1 px-4 rounded-md mt-2 shadow-red-300 shadow-md bg-white text-black">{city}</span>
      </Link>

      <Link to="/country" className="lg:w-full w-[80%] h-[150px] bg-white shadow-red-300 shadow-md rounded-md flex flex-col items-center justify-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-black font-bold text-xl"><FaFlag /></span>
          <p className="text-black font-bold text-lg">Countries</p>
        </div>
        <span className="font-bold border-2 text-xl p-1 px-4 rounded-md mt-2 shadow-red-300 shadow-md bg-white text-black">{country}</span>
      </Link>
    </div>

      <div className="lg:flex text-center justify-center shadow-lg bg-white lg:p-8 m-4 mr-7  rounded-lg">
        <PieChart className="w-1/2" />
      </div>
    </>
  );
};

export default Dashboard;
