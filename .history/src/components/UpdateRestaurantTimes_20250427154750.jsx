import React, { useState } from "react";
import axios from "axios";
import { base_url } from "../api";

function UpdateRestaurantTimes() {
  const [openTime, setOpenTime] = useState("09:00 AM");
  const [closeTime, setCloseTime] = useState("10:00 PM");
  const [message, setMessage] = useState("");

  // Tokeni və digər başlıqları əldə edən funksiya
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  console.log(getHeaders(), "getHeaders");

  // AM/PM formatını 24-saat formatına çevirmək üçün funksiya
  const formatTimeTo24Hour = (time) => {
    const [hourMinute, period] = time.split(" ");
    let [hour, minute] = hourMinute.split(":");
    hour = parseInt(hour);
    if (period === "PM" && hour !== 12) {
      hour += 12;
    }
    if (period === "AM" && hour === 12) {
      hour = 0;
    }
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  };

  const updateTimes = async () => {
    const url = `${base_url}/restaurant/times`; // API-nin URL-si
    const data = {
      open_time: formatTimeTo24Hour(openTime),
      close_time: formatTimeTo24Hour(closeTime),
    };

    try {
      // PUT sorğusu
      const response = await axios.put(url, data, {
        headers: getHeaders(), // Header-ları əlavə et
      });

      console.log(response.data, "API-dən nəticə");
      setMessage(response.data.message); // Cavab mesajını göstər
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Xəta baş verdi: Sorğu yerinə yetirilmədi."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Restoran İş Saatlarını Yenilə
      </h1>
      <label className="block mb-4">
        <span className="text-gray-700">Açılış vaxtı (hh:mm AM/PM):</span>
        <input
          type="text"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
          placeholder="09:00 AM"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
      </label>
      <label className="block mb-4">
        <span className="text-gray-700">Bağlanış vaxtı (hh:mm AM/PM):</span>
        <input
          type="text"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
          placeholder="10:00 PM"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
      </label>
      <button
        onClick={updateTimes}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
      >
        Yenilə
      </button>
      {message && (
        <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
      )}
    </div>
  );
}

export default UpdateRestaurantTimes;
