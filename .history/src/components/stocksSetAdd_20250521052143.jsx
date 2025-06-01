import React, { useState, useEffect } from "react";
import axios from "axios";
import AccessDenied from "./AccessDenied";
import { base_url } from "../api/index";
import { FaTrash } from "react-icons/fa";

// Function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

// Component for additional price inputs
const AdditionalPriceInput = ({
  prices,
  onPriceChange,
  onCountChange,
  onNumberChange,
  addPrice,
  removePrice,
}) => (
  <>
    {prices.map((priceObj, index) => (
      <div key={index} className="flex mb-3 gap-2">
        {/* Quantity Input */}
        <input
          className="border rounded-l py-2 px-3 w-5/12 text-sm font-medium"
          type="number"
          value={priceObj.count}
          onChange={(e) => onNumberChange(e, index)}
          placeholder="1 "
          required
        />
        <input
          className="border rounded-l py-2 px-3 w-5/12 text-sm font-medium"
          type="string"
          value={priceObj.unit}
          onChange={(e) => onCountChange(e, index)}
          placeholder="Ədəd"
          required
        />
        {/* Price Input */}
        <input
          className="border rounded-l py-2 px-3 w-5/12 text-sm font-medium"
          type="number"
          value={priceObj.price}
          onChange={(e) => onPriceChange(e, index)}
          step="0.01"
          placeholder="20 AZN"
          required
        />
        <button
          type="button"
          onClick={() => removePrice(index)}
          className="border shadow-md bg-gray-300 hover:bg-gray-100 text-center w-2/12 rounded-r py-2 px-3 cursor-pointer"
        >
          <FaTrash className="text-red-500" />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={addPrice}
      className="border mr-4 mb-2 hover:bg-sky-500 rounded py-2 px-4 bg-sky-600 text-white text-sm font-medium mt-2"
    >
      Çoxlu qiymət və say əlave et
    </button>
  </>
);

function AddStok({ setAddStok }) {
  const [formData, setFormData] = useState({
    name: "",

    show_on_qr: false,
    price: 0,
    amount: 0,
    alert_critical: false,
    critical_amount: 1,

    additionalPrices: [],

  });
  const [stockSets, setStockSets] = useState([]);
  console.log(formData, "formdata");
  const [groups, setGroups] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([]);
  
  const [selectedRawMaterials, setSelectedRawMaterials] = useState([
    { id: "", quantity: 1 },
  ]);

  useEffect(() => {
  const fetchStockSets = async () => {
    try {
      const response = await axios.get(
        `${base_url}/stock-sets`,
        getAuthHeaders()
      );
      setStockSets(response.data); // API yapınıza göre response path'ini ayarlayın
    } catch (error) {
      console.error("Error fetching stock sets:", error);
    }
  };
  fetchStockSets();
}, []);
  
  const handleRawMaterialChange = (index, field, value) => {
    const updated = [...selectedRawMaterials];
    updated[index][field] = value;
    setSelectedRawMaterials(updated);
  };
  
  const addRawMaterialField = () => {
    setSelectedRawMaterials([...selectedRawMaterials, { id: "", quantity: 1 }]);
  };
  
  const removeRawMaterialField = (index) => {
    const updated = selectedRawMaterials.filter((_, i) => i !== index);
    setSelectedRawMaterials(updated);
  };

  console.log("rawMaterials",rawMaterials);
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `${base_url}/stock-groups`,
          getAuthHeaders()
        );
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const formDataToSend = new FormData();
  
  // Əsas məlumatlar
  formDataToSend.append("name", formData.name);
  formDataToSend.append("price", formData.price); // Əgər null qəbul edirsə, null göndər

  // Stocks (Əvvəlki additionalPrices) məlumatları
  formData.additionalPrices.forEach((stock, index) => {
    formDataToSend.append(`stocks[${index}][id]`, stock.id);
    formDataToSend.append(`stocks[${index}][quantity]`, stock.quantity);
  });

  // Raw Materials (Xammallar)
  selectedRawMaterials.forEach((material, index) => {
    formDataToSend.append(`raw_materials[${index}][id]`, material.id);
    formDataToSend.append(`raw_materials[${index}][quantity]`, material.quantity);
  });

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${base_url}/stock-sets`, formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    
    setAddStok(false);
  } catch (error) {
    // Xəta idarəetmə
  }
};


  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/raw-materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response",response);
      
      setRawMaterials(response.data.data);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };



  useEffect(() => {
    fetchData();
  }, []);


  if (accessDenied) return <AccessDenied onClose={setAccessDenied} />;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-4 w-full"
    >
      <div className="bg-gray-50 rounded border p-3 w-full md:w-1/2">
        {/* Image Upload */}
    

        {/* Other Form Fields */}
        <div className="border rounded flex items-center py-2 px-5 w-full bg-white mb-5">
          <input
            className="mr-3 h-6"
            type="checkbox"
            name="show_on_qr"
            checked={formData.show_on_qr}
            onChange={handleChange}
          />
          <label className="text-sm font-semibold">QR menüde göster</label>
        </div>

        <label className="text-sm font-semibold mb-2">Adı</label>
        <input
          className="border rounded py-2 px-3 w-full text-sm font-medium mb-5"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

  

        <button
          type="submit"
          className="bg-sky-600 font-medium py-2 px-4 rounded text-white"
        >
          Saxla
        </button>
      </div>


      <div className="bg-gray-50 flex flex-col rounded border p-3 w-full md:w-1/2">
        {/* Main Price */}
        <h3 className="mb-2">Satış qiyməti</h3>
        {/* Additional Prices */}
        <div className="flex mb-3 gap-2">
          <input
            className="border rounded py-2 px-3 w-10/12 text-sm font-medium"
            type="number"
            name="price"
           
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            required
          />
          <div className="border border-l-0 bg-gray-50 text-center w-2/12 rounded-r py-2 px-3">
            ₼
          </div>
        </div>
    

 <div className="mb-4">
    <h3 className="mb-2">Stok Setleri</h3>
    <select 
      className="border rounded py-2 px-3 w-full text-sm font-medium"
      onChange={(e) => handleChange(e)} // Seçim değiştiğinde formData'yı güncellemek için
      name="stock_set"
    >
      <option value="">Stok Seti Seçin</option>
      {stockSets.map((set) => (
        <option key={set.id} value={set.id}>
          {set.name}
        </option>
      ))}
    </select>
  </div>
   
      </div>

      
    </form>
  );
}

export default AddStok;