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

  const validStocks = selectedStockSet.stocks.map(stock => ({
    ...stock,
    quantity: stock.quantity ?? 0,
  }));

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);

    // If image exists and is a File object, add it to formData
    if (formData.image instanceof File) {
      formDataToSend.append("image", formData.image);
    }

    // Append stocks JSON as string (if your backend expects this format)
    formDataToSend.append("stocks", JSON.stringify(validStocks));

    const headers = {
      ...getAuthHeaders().headers,
      "Content-Type": "multipart/form-data",
    };

    const response = await axios.post( // use POST or PUT depending on your backend
      `${base_url}/stock-sets/${selectedStockSet.id}`,
      formDataToSend,
      { headers }
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

    </div>
  );
};

export default UpdateStockSetForm;