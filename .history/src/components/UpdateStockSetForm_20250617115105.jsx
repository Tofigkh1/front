import React, { useState, useEffect } from "react";
import axios from "axios";
import { base_url } from "../api";

const UpdateStockSetForm = () => {
  const [stockSets, setStockSets] = useState([]);
  const [selectedStockSet, setSelectedStockSet] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
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



  return (
    <div className="bg-white p-4 rounded shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4">Stock Set Güncəlləmə</h2>

      <select
        className="border rounded w-full p-2 mb-4"
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

   {selectedStockSet.stocks.map((stock, index) => (
  <div key={stock.id} className="mb-2">
    <p className="font-medium">{`Stock ID: ${stock.id}`}</p>
    <input
      type="number"
      min="1"
      step="1"
      value={stock.quantity}
      onChange={(e) => {
        const newStocks = [...selectedStockSet.stocks];
        newStocks[index].quantity = Number(e.target.value);
        setSelectedStockSet({ ...selectedStockSet, stocks: newStocks });
      }}
      className="border rounded w-full p-2 mt-1"
      placeholder="Miqdar"
    />
  </div>
))}

    </div>
  );
};

export default UpdateStockSetForm;