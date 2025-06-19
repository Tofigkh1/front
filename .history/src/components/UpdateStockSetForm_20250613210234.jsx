import React, { useState, useEffect } from "react";
import axios from "axios";
import { base_url } from "../api";

const UpdateStockSetForm = () => {
  const [stockSets, setStockSets] = useState([]);
  const [selectedStockSet, setSelectedStockSet] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);

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

const handleSave = async () => {
  if (!selectedStockSet) return;

  // Stok verilerini backend'in beklediği formatta hazırla
  const validStocks = selectedStockSet.stocks.map(stock => ({
    id: stock.id,
    quantity: stock.quantity ?? 0,
    price: stock.price ?? 0 // price alanını ekledik
  }));

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);

    // Eğer yeni resim yüklenmediyse mevcut resim adını kullan
    if (formData.image instanceof File) {
      formDataToSend.append("image", formData.image);
    } else {
      formDataToSend.append("image", selectedStockSet.image || "");
    }

    // Backend formatına uygun JSON string oluştur
    formDataToSend.append("stocks", JSON.stringify(validStocks));

    const headers = {
      ...getAuthHeaders().headers,
      "Content-Type": "multipart/form-data",
    };

    await axios.put(
      `${base_url}/stock-sets/${selectedStockSet.id}`,
      formDataToSend,
      { headers }
    );

    alert("Uğurla güncəlləndi!");
  } catch (error) {
    console.error("Update error:", error.response?.data || error);
    alert("Xəta baş verdi!");
  }
};

const validStocks = selectedStockSet.stocks.map(stock => ({
  id: stock.id,
  quantity: stock.quantity ?? 0,
  price: stock.price ?? 0 // backend'in beklediği price alanı eklendi
}));

const handleFileChange = (e) => {
  setFormData((prev) => ({
    ...prev,
    image: e.target.files[0],
  }));
};

if (formData.image instanceof File) {
  formDataToSend.append("image", formData.image);
} else {
  // Yeni resim yüklenmezse mevcut resim adını kullan
  formDataToSend.append("image", selectedStockSet.image || "");
}

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

      {loading ? (
        <p className="text-center py-4">Yüklənir...</p>
      ) : (
        selectedStockSet && (
          <>
            <input
              type="text"
              name="name"
              className="border rounded w-full p-2 mb-2"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Yeni ad"
            />

            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              className="border rounded w-full p-2 mb-4"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Yeni qiymət"
            />
            <input
  type="file"
  name="image"
  accept="image/*"
  className="border rounded w-full p-2 mb-4"
  onChange={handleFileChange}
/>


            <button
              onClick={handleSave}
              className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition"
            >
              Güncəllə
            </button>
          </>
        )
      )}
    </div>
  );
};

export default UpdateStockSetForm;