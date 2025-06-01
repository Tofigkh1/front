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
    price: null, // Backend null bekliyorsa başlangıç değeri null olmalı
    stocks: [] // additionalPrices yerine doğru isimlendirme
  });
    const [availableStocks, setAvailableStocks] = useState([]);
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




  // Yeni stok ekleme alanı
  const addStockField = () => {
    setFormData(prev => ({
      ...prev,
      stocks: [...prev.stocks, { id: "", quantity: 1 }]
    }));
  };

  // Stok alanını kaldırma
  const removeStockField = index => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.filter((_, i) => i !== index)
    }));
  };

  // Stok inputlarını yönetme
  const handleStockChange = (index, field, value) => {
    const newStocks = [...formData.stocks];
    newStocks[index][field] = value;
    setFormData(prev => ({ ...prev, stocks: newStocks }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      price: formData.price || null, // 0 yerine null gönder
      stocks: formData.stocks.map(stock => ({
        id: parseInt(stock.id),
        quantity: parseInt(stock.quantity)
      }))
    };

    try {
      const response = await axios.post(`${base_url}/stock-sets`, payload, getAuthHeaders());
      setAddStok(false);
    } catch (error) {
      console.error("Hata:", error.response?.data);
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
     <form onSubmit={handleSubmit}>
      {/* İsim Alanı */}
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={e => setFormData({...formData, name: e.target.value})}
        required
      />

      {/* Fiyat Alanı */}
      <input
        type="number"
        name="price"
        value={formData.price || ""}
        onChange={e => setFormData({...formData, price: e.target.value || null})}
      />

      {/* Stoklar için Dinamik Alanlar */}
      {formData.stocks.map((stock, index) => (
        <div key={index}>
          <select
            value={stock.id}
            onChange={e => handleStockChange(index, "id", e.target.value)}
            required
          >
            <option value="">Stok Seçin</option>
            {availableStocks.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <input
            type="number"
            value={stock.quantity}
            onChange={e => handleStockChange(index, "quantity", e.target.value)}
            min="1"
            required
          />

          <button type="button" onClick={() => removeStockField(index)}>
            Kaldır
          </button>
        </div>
      ))}

      <button type="button" onClick={addStockField}>
        Stok Ekle
      </button>

      <button type="submit">Kaydet</button>
    </form>
  );
}

export default AddStok;