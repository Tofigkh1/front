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
   <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-8 overflow-y-auto" style={{ maxHeight: '90vh' }}>
  <h2 className="text-lg font-semibold mb-4">Yeniləyin Stok</h2>

  {item?.image && (
    <div className="mb-4 flex justify-center">
      <img
        src={`${img_url}/${item.image}`}
        alt="Stock Image"
        className="w-full h-[100px] object-contain rounded mb-4"
      />
    </div>
  )}

  <form onSubmit={handleSubmit}>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" htmlFor="name">Adı</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="border rounded px-3 py-2 w-full"
        required
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" htmlFor="amount">Stok</label>
      <input
        type="number"
        id="amount"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        className="border rounded px-3 py-2 w-full"
        required
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" htmlFor="price">Satış fiyatı</label>
      <input
        type="number"
        id="price"
        name="price"
        value={formData.price}
        onChange={handleChange}
        className="border rounded px-3 py-2 w-full"
        required
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" htmlFor="critical_amount">Kritik Miktar</label>
      <input
        type="number"
        id="critical_amount"
        name="critical_amount"
        value={formData.critical_amount}
        onChange={handleChange}
        className="border rounded px-3 py-2 w-full"
        required
      />
    </div>

    {selectedRawMaterials.map((material, index) => (
      <div key={index} className="mb-4">
        <label className="block text-sm font-medium mb-1">Xammal #{index + 1}</label>
        <div className="flex items-center gap-2">
          <select
            className="border rounded py-2 px-3 w-full text-sm font-medium"
            value={material.id}
            onChange={(e) => handleRawMaterialChange(index, "id", e.target.value)}
            required
          >
            <option value="">Seçin</option>
            {rawMaterialss.map((raw) => (
              <option key={raw.id} value={raw.id}>{raw.name}</option>
            ))}
          </select>
          <input
            className="border rounded py-2 px-3 w-full text-sm font-medium"
            type="number"
            step="0.01"
            value={material.quantity}
            onChange={(e) => handleRawMaterialChange(index, "quantity", e.target.value)}
            required
          />
        </div>
      </div>
    ))}

    <button
      type="button"
      onClick={() => setSelectedRawMaterials([...selectedRawMaterials, { id: "", quantity: 1 }])}
      className="bg-sky-600 hover:bg-sky-500 text-white py-1 px-3 rounded text-sm mb-4"
    >
      + Yeni xammal əlavə et
    </button>

    <div className="mb-4">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          id="alert_critical"
          name="alert_critical"
          checked={formData.alert_critical}
          onChange={handleChange}
          className="form-checkbox"
        />
        <span className="ml-2">Kritik uyarı aktiv</span>
      </label>
    </div>

    <div className="mb-4">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          id="show_on_qr"
          name="show_on_qr"
          checked={formData.show_on_qr}
          onChange={handleChange}
          className="form-checkbox"
        />
        <span className="ml-2">QR Menüde Göster</span>
      </label>
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" htmlFor="stock_group_id">Grup</label>
      <select
        id="stock_group_id"
        name="stock_group_id"
        value={formData.stock_group_id || ''}
        onChange={handleChange}
        className="border rounded px-3 py-2 w-full"
        required
      >
        <option value="">Seçiniz</option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>{group.name}</option>
        ))}
      </select>
    </div>

    <div className="flex gap-4">
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition">
        Güncəllə
      </button>
      <button
        type="button"
        onClick={onClose}
        className="bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600 transition"
      >
        Kapat
      </button>
    </div>
  </form>
</div>

  );
};

export default UpdateStockSetForm;