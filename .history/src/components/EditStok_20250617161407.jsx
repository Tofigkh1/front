


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccessDenied from './AccessDenied';
import { base_url, img_url } from '../api/index';
// import { FaTrash } from 'react-icons/fa';

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    };
};

const EditStok = ({ item, onClose, onUpdate, rawMaterials, detailsItem }) => {
    console.log("rawMaterials", rawMaterials);


    useEffect(() => {
        if (rawMaterials && rawMaterials.length > 0) {
            const formatted = rawMaterials.map(raw => ({
  id: String(raw.id),
  quantity: parseFloat(raw.pivot?.quantity || '1')
}));

            setSelectedRawMaterials(formatted);
        }
    }, [rawMaterials]);


    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        price: '',
        show_on_qr: false,
        stock_group_id: null,
        critical_amount: '',
        alert_critical: false,
        // order_start: '00:00',
        // order_stop: '24:00'
    });
    const [groups, setGroups] = useState([]);
    const [accessDenied, setAccessDenied] = useState(false);

    const [rawMaterialss, setRawMaterialss] = useState([]);

    const [selectedRawMaterials, setSelectedRawMaterials] = useState([
        { id: "", quantity: 1 },
    ]);

    const handleRawMaterialChange = (index, field, value) => {
        const updated = [...selectedRawMaterials];
        updated[index][field] = value;
        setSelectedRawMaterials(updated);
    };

    //   const addRawMaterialField = () => {
    //     setSelectedRawMaterials([...selectedRawMaterials, { id: "", quantity: 1 }]);
    //   };

    //   const removeRawMaterialField = (index) => {
    //     const updated = selectedRawMaterials.filter((_, i) => i !== index);
    //     setSelectedRawMaterials(updated);
    //   };


    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${base_url}/raw-materials`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("response", response);

            setRawMaterialss(response.data.data);
        } catch (error) {
            console.error("Error fetching raw materials:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    useEffect(() => {
        if (item) {

            setFormData({
                name: item.name,
                amount: item.amount,
                price: item.price,
                show_on_qr: item.show_on_qr || false,
                stock_group_id: item.stock_group_id,
                critical_amount: item.critical_amount || '',
                alert_critical: item.alert_critical || false,
                // order_start: item.order_start.slice(0,5) || '00:00',
                // order_stop: item.order_stop.slice(0,5) || "24:00"
            });

        }
    }, [item]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get(`${base_url}/stock-groups`, getAuthHeaders());
                setGroups(response.data);
            } catch (error) {
                console.error('Error fetching groups', error);
            }
        };

        fetchGroups();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();



        const updatedFormData = {

            ...formData,

        };



        try {
            await axios.put(`${base_url}/stocks/${item.id}`, updatedFormData, getAuthHeaders());
            onUpdate(); // Refresh items after update
            onClose(); // Close the edit popup
        } catch (error) {
            if (error.response && error.response.status === 403 && error.response.data.message === "Forbidden") {
                setAccessDenied(true); // Set access denied if response status is 403
            } else {
                console.error('Error updating item', error);
            }
        }


        try {

            const token = localStorage.getItem("token");


            // Sonra hammaddeleri güncelle
            const payload = {
  raw_materials: selectedRawMaterials
    .filter(mat => mat.id && !isNaN(mat.id) && mat.quantity && !isNaN(mat.quantity))
    .map(mat => ({
      id: Number(mat.id),           // Must match raw_material.id, not stock.id
      quantity: Number(mat.quantity),
    }))
};

            console.log("payload", payload);

            await axios.put(
                `${base_url}/stocks/${detailsItem.id}/raw-materials`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            onUpdate(); // Listeyi yenile
            onClose();  // Popup'u kapat
        } catch (error) {
            if (
                error.response &&
                error.response.status === 403 &&
                error.response.data.message === "Forbidden"
            ) {
                setAccessDenied(true);
            } else {
                console.error("Error updating item or raw materials", error);
            }
        }
    };
    console.log("Göndərilən raw_materials:",rawMaterialss);


    if (accessDenied) return <AccessDenied onClose={setAccessDenied} />;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full overflow-y-auto" style={{ maxHeight: '90vh' }}>
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
            </div>
        </div>
    );
};

export default EditStok;
