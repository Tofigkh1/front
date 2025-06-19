import React, { useState, useEffect } from "react";
import axios from "axios";
import { base_url } from "../api";

const UpdateStockSetForm = () => {
  const [stockSets, setStockSets] = useState([]);
  const [selectedStockSet, setSelectedStockSet] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState([{ id: "", quantity: 1 }]);
console.log("formData",formData);
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
  };

  useEffect(() => {
    axios
      .get(`${base_url}/stock-sets`, getAuthHeaders())
      .then((res) => setStockSets(res.data))
      .catch((err) => console.error("Error loading sets:", err));
  }, []);

  const handleSelectChange = (e) => {
    const id = Number(e.target.value);
    const selected = stockSets.find((set) => set.id === id);
    
    if (selected) {
  setLoading(true);
  // Fetch full stock set details to get latest stocks
  axios.get(`${base_url}/stock-sets/${id}`, getAuthHeaders())
    .then(res => {
      setSelectedStockSet(res.data);
      setFormData({ 
        name: res.data.name, 
        price: res.data.price 
      });
    })
    .finally(() => setLoading(false));
}
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };


  const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};



const handleSave = async () => {
  if (!selectedStockSet) return;

  // Validate quantity values
  const validStocks = selectedStockSet.stocks.map((stock) => ({
    id: stock.id,
    quantity: Math.max(Number(stock.quantity || 0), 1), // min 1
    price: Number(stock.price),
  }));

  try {
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      stocks: validStocks,
    };

    // Convert image to base64 if exists
    if (formData.image instanceof File) {
      const base64Image = await convertFileToBase64(formData.image);
      payload.image = base64Image;
    }

    const response = await axios.put(
      `${base_url}/stock-sets/${selectedStockSet.id}`,
      payload,
      {
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "application/json",
        },
      }
    );

    alert("Uğurla güncəlləndi!");
    console.log("Updated:", response.data);
  } catch (error) {
    console.error("Update error:", error.response?.data || error);
    alert("Xəta baş verdi!");
  }
};



const handleFileChange = (e) => {
  setFormData((prev) => ({
    ...prev,
    image: e.target.files[0],
  }));
};


  const handleStockChange = (index, field, value) => {
  const updated = [...selectedStocks];
  updated[index][field] = value;
  setSelectedStocks(updated);
};

const addStockField = () => {
  setSelectedStocks([...selectedStocks, { id: "", quantity: 1 }]);
};

const removeStockField = (index) => {
  const updated = selectedStocks.filter((_, i) => i !== index);
  setSelectedStocks(updated);
};


  return (
<div className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto mt-12">
  <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">📦 Stock Set Güncəlləmə</h2>

  <select
    className="border border-gray-300 rounded-lg w-full p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
    onChange={handleSelectChange}
    defaultValue=""
    disabled={loading}
  >
    <option value="" disabled>
      Set seçin
    </option>
    {stockSets.map((set) => (
      <option key={set.id} value={set.id}>
        {set.name} — {set.price} ₼
      </option>
    ))}
  </select>

  {loading ? (
    <p className="text-center py-6 text-gray-500">⏳ Yüklənir...</p>
  ) : (
    selectedStockSet && (
      <>
        <input
          type="text"
          name="name"
          className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Yeni ad"
        />

        <input
          type="number"
          name="price"
          min="0"
          step="0.01"
          className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Yeni qiymət"
        />

        <label className="block w-full mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-1">Set şəkli:</span>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleFileChange}
          />
        </label>

        <div className="mb-4">
  <h3 className="mb-2">Stoklar</h3>
  {selectedStocks.map((stock, index) => (
    <div key={index} className="flex gap-2 mb-2">
      <select
        value={stock.id}
        onChange={(e) => handleStockChange(index, 'id', e.target.value)}
        className="border rounded py-2 px-3 w-full"
        required
      >
        <option value="">Stok seçin</option>
        {stockSets.map((item) => (
          <option key={item.id} value={item.id}>
            
            <div className="flex ml-6">
     <div >
     {item.name}
            </div>
       <div className=" ml-6">
         {item.price}
       </div>
            </div>
       
    
          </option>
        ))}
      </select>
      <input
        type="number"
        value={stock.quantity}
        onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
        className="border rounded py-2 px-3 w-20"
        min="1"
        required
      />
      <button
        type="button"
        onClick={() => removeStockField(index)}
        className="bg-red-500 text-white px-3 rounded"
      >
        ✕
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={addStockField}
    className="bg-blue-500 text-white px-3 py-1 rounded"
  >
    + Stok Ekle
  </button>
</div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white py-3 px-4 rounded-lg w-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          ✅ Güncəllə
        </button>
      </>
    )
  )}
</div>


  );
};

export default UpdateStockSetForm;