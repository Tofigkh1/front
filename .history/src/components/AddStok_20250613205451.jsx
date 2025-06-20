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
    stock_group_id: "",
    image: null,
    show_on_qr: false,
    price: 0,
    amount: 0,
    alert_critical: false,
    critical_amount: 1,
    item_type: "sayilan",
    additionalPrices: [],
    description: "",
  });
  console.log(formData, "formdata");
  const [groups, setGroups] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([]);

  const [selectedRawMaterials, setSelectedRawMaterials] = useState([
    { id: "", quantity: 1 },
  ]);

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

  console.log("rawMaterials", rawMaterials);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        image: file,
      }));
    }
  };

  const handleAdditionalPriceChange = (e, index) => {
    const newPrices = [...formData.additionalPrices];
    newPrices[index] = { ...newPrices[index], price: e.target.value };
    setFormData((prevData) => ({
      ...prevData,
      additionalPrices: newPrices,
    }));
  };
  const handleAdditionalNumberChange = (e, index) => {
    const newPrices = [...formData.additionalPrices];
    newPrices[index] = { ...newPrices[index], count: e.target.value };
    setFormData((prevData) => ({
      ...prevData,
      additionalPrices: newPrices,
    }));
  };

  const handleCountChange = (e, index) => {
    const newPrices = [...formData.additionalPrices];
    newPrices[index] = { ...newPrices[index], unit: e.target.value };
    setFormData((prevData) => ({
      ...prevData,
      additionalPrices: newPrices,
    }));
  };

  const addPriceInput = () => {
    setFormData((prevData) => ({
      ...prevData,
      additionalPrices: [
        ...prevData.additionalPrices,
        { price: "", count: "" },
      ],
    }));
  };
  const handleDescriptionProduct = (e) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const formDataToSend = new FormData();

    // Append main form data and additional prices
    formDataToSend.append("name", formData.name);
    formDataToSend.append("stock_group_id", formData.stock_group_id);
    if (formData.image) formDataToSend.append("image", formData.image);
    formDataToSend.append("show_on_qr", formData.show_on_qr ? "1" : "0");
    formDataToSend.append("price", formData.price);
    formDataToSend.append("amount", formData.amount); // Miqdar burada təyin olunur
    formDataToSend.append("description", formData.description);
    formDataToSend.append("alert_critical", formData.alert_critical ? "1" : "0");
    formDataToSend.append("critical_amount", formData.critical_amount);
    formDataToSend.append("item_type", formData.item_type);

    // Append additional prices
    formData.additionalPrices.forEach((priceObj, index) => {
      formDataToSend.append(`additionalPrices[${index}][price]`, priceObj.price);
      formDataToSend.append(`additionalPrices[${index}][unit]`, priceObj.unit);
      formDataToSend.append(`additionalPrices[${index}][count]`, priceObj.count);
    });

    try {
      const token = localStorage.getItem("token");
      const stockResponse = await axios.post(`${base_url}/stocks`, formDataToSend, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      const stockId = stockResponse.data?.id;
      console.log("stockId", stockId);

      if (stockId && selectedRawMaterials.length > 0) {
        await axios.post(
          `${base_url}/stocks/${stockId}/attach-raw-material`,
          {
            raw_materials: selectedRawMaterials.map((mat) => ({
              id: parseInt(mat.id),
              quantity: parseFloat(mat.quantity),
            })),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }



      setAddStok(false);
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message === "Forbidden"
      ) {
        setAccessDenied(true);
      } else {
        console.error("Error adding stock:", error);
        alert("An error occurred while adding the stock. Please try again later.");
      }
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
      console.log("response", response);

      setRawMaterials(response.data.data);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };


  const removePrice = (index) => {
    setFormData((prevData) => {
      const newPrices = prevData.additionalPrices.filter((_, i) => i !== index);
      return { ...prevData, additionalPrices: newPrices };
    });
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
    


    </form>
  );
}

export default AddStok;