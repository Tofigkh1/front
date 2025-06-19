import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { base_url } from '../api';

const UpdateComponent = () => {
  const [stockSets, setStockSets] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [selectedStockSet, setSelectedStockSet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: null,
    preview: null,
  });
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    };
  };

  useEffect(() => {
    axios.get(`${base_url}/stock-sets`, getAuthHeaders())
      .then(res => setStockSets(res.data))
      .catch(err => console.error("Stock set yüklənmə xətası:", err));

    axios.get(`${base_url}/stocks`, getAuthHeaders())
      .then(res => setAllStocks(res.data))
      .catch(err => console.error("Stock siyahısı yüklənmə xətası:", err));
  }, []);

  const handleSelectChange = (e) => {
    const id = Number(e.target.value);
    const selected = stockSets.find((set) => set.id === id);
    if (selected) {
      setLoading(true);
      axios.get(`${base_url}/stock-sets/${id}`, getAuthHeaders())
        .then(res => {
          const data = res.data;
          setSelectedStockSet(data);
          setFormData({
            name: data.name,
            price: data.price,
            image: null,
            preview: data.image_url,
          });
          setSelectedStocks(data.stocks.map(stock => ({
            id: stock.id,
            quantity: stock.pivot?.quantity || 1,
            price: stock.pivot?.price || stock.price,
            name: stock.name,
            image: stock.image_url || '',
            imageFile: null
          })));
        })
        .finally(() => setLoading(false));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  const handleStockChange = (index, field, value) => {
    const updated = [...selectedStocks];
    if (field === 'image') {
      const file = value;
      updated[index].imageFile = file;
      updated[index].image = URL.createObjectURL(file);
    } else {
      updated[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value;
    }
    setSelectedStocks(updated);
  };

  const addStockField = () => {
    setSelectedStocks([...selectedStocks, {
      id: '',
      quantity: 1,
      price: 0,
      name: '',
      image: '',
      imageFile: null,
    }]);
  };

  const removeStockField = (index) => {
    const updated = selectedStocks.filter((_, i) => i !== index);
    setSelectedStocks(updated);
  };

  const handleSave = async () => {
    if (!selectedStockSet) return;

    const form = new FormData();
    form.append('name', formData.name);
    form.append('price', formData.price);
    if (formData.image instanceof File) {
      form.append('image', formData.image);
    }

    selectedStocks.forEach((stock, index) => {
      form.append(`stocks[${index}][id]`, stock.id);
      form.append(`stocks[${index}][quantity]`, stock.quantity);
      form.append(`stocks[${index}][price]`, stock.price);
      form.append(`stocks[${index}][name]`, stock.name);
      if (stock.imageFile instanceof File) {
        form.append(`stocks[${index}][image]`, stock.imageFile);
      }
    });

    try {
      const response = await axios.post(
        `${base_url}/stock-sets/${selectedStockSet.id}?_method=PUT`,
        form,
        {
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('✅ Uğurla güncəlləndi!');
      console.log('Updated:', response.data);
    } catch (error) {
      console.error('Update error:', error.response?.data || error);
      alert('❌ Güncəlləmə zamanı xəta baş verdi!');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-6 text-center">📦 Stock Set Güncəlləmə</h2>

      <select
        className="border rounded-lg w-full p-3 mb-5"
        onChange={handleSelectChange}
        defaultValue=""
        disabled={loading}
      >
        <option value="" disabled>Set seçin</option>
        {stockSets.map((set) => (
          <option key={set.id} value={set.id}>{set.name} — {set.price} ₼</option>
        ))}
      </select>

      {loading ? (
        <p className="text-center py-6">⏳ Yüklənir...</p>
      ) : selectedStockSet && (
        <>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="border rounded w-full p-3 mb-4"
            placeholder="Yeni ad"
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="border rounded w-full p-3 mb-4"
            placeholder="Yeni qiymət"
          />
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
          {formData.preview && <img src={formData.preview} alt="Preview" className="w-32 h-32 mb-4 rounded shadow" />}

          {selectedStocks.map((stock, index) => (
            <div key={index} className="mb-4 border p-3 rounded-lg">
              <input
                type="text"
                value={stock.name}
                onChange={(e) => handleStockChange(index, 'name', e.target.value)}
                className="border p-2 rounded w-full mb-2"
                placeholder="Stok adı"
              />
              <input
                type="number"
                value={stock.quantity}
                onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
                className="border p-2 rounded w-full mb-2"
                placeholder="Miqdar"
              />
              <input
                type="number"
                value={stock.price}
                onChange={(e) => handleStockChange(index, 'price', e.target.value)}
                className="border p-2 rounded w-full mb-2"
                placeholder="Qiymət"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleStockChange(index, 'image', e.target.files[0])}
                className="mb-2"
              />
              {stock.image && <img src={stock.image} alt="Stock" className="w-24 h-24 object-cover rounded" />}
              <button onClick={() => removeStockField(index)} className="bg-red-500 text-white px-3 py-1 mt-2 rounded">Sil</button>
            </div>
          ))}

          <button
            onClick={addStockField}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            + Yeni Stok
          </button>

          <button
            onClick={handleSave}
            className="bg-green-600 text-white w-full py-3 rounded hover:bg-green-700 transition"
          >
            ✅ Güncəllə
          </button>
        </>
      )}
    </div>
  );
};

export default UpdateComponent;
