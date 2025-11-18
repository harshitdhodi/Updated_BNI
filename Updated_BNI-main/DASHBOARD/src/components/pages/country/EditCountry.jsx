import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditCountry = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchCountry();
  }, [id]);

  const fetchCountry = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/country/getCountryById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const { name, photo } = response.data;
      setName(name);
      setPhotos(photo);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name); // Ensure name is correctly updated
    newImages.forEach((image) => {
      formData.append("photo", image); // Ensure 'photo' matches backend expectation
    });

    console.log("FormData before axios request:", formData); // Debugging: Check FormData content before sending

    try {
      const token = getCookie("token");
      const response = await axios.put(
        `/api/country/updateCountryById?id=${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setName("");
        setNewImages([]);
        navigate("/country");
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Failed to update country:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]); // Ensure newImages state is updated correctly
  };

  return (
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-red-300 hover:text-red-400">
            Dashboard /
          </Link>
          <Link to="/country" className="mr-2 text-red-300 hover:text-red-400">
            {" "}
            Countries /
          </Link>
          <Link className="font-semibold text-gray-600"> Edit Country</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit Country</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block font-semibold mb-2">
              Country Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none"
              required
            />
          </div>
          {photos.length > 0 && (
            <div className="mb-4">
              <p className="font-semibold mb-2">Current Image(s):</p>
              <div className="flex flex-wrap gap-4">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={`/image/download/${photo}`}
                    alt={`Country Image ${index + 1}`}
                    className="w-40 h-auto rounded-md"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="image" className="block font-semibold mb-2">
              Upload New Image(s)
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="border rounded p-2 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
          >
            Save
          </button>
        </form>
      </div>
    </>
  );
};

export default EditCountry;
