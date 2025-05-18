import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { base_url } from "../api/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { FaEdit } from "react-icons/fa"

const AddWarehouseProduct = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  console.log("rawMaterials",rawMaterials);
  

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/raw-materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRawMaterials(response.data.data);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${base_url}/raw-materials/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Xammal silindi", {
        position: "top-right",
        autoClose: 1000,
      });

      fetchData();
    } catch (error) {
      console.error("Xammal silinərkən xəta baş verdi:", error);
      toast.error("Xəta baş verdi. Yenidən yoxlayın.", {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditedValues({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: editedValues.name,
        quantity: Number(editedValues.quantity),
        unit: Number(editedValues.unit),
      };

      await axios.put(`${base_url}/raw-materials/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Xammal yeniləndi", {
        position: "top-right",
        autoClose: 1000,
      });

      setEditId(null);
      setEditedValues({});
      fetchData();
    } catch (error) {
      console.error("Xammal yenilənərkən xəta baş verdi:", error);
      toast.error("Xəta baş verdi. Yenidən yoxlayın.", {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      quantity: "",
      unit: "1",
    },
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem("token");
        const payload = {
          name: values.name,
          quantity: Number(values.quantity),
          unit: Number(values.unit),
        };

        await axios.post(`${base_url}/raw-materials`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.info("Xammal əlavə olundu", {
          position: "top-right",
          autoClose: 1000,
        });

        fetchData();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Bu ad istifadə edilib. Yenidən yoxlayın.", {
          position: "top-right",
          autoClose: 1000,
        });
      }
    },
  });

  const category = [
    { id: 1, label: "Kg" },
    { id: 2, label: "Miqdar" },
    { id: 3, label: "Litr" },
    { id: 4, label: "Qram" },
  ];

  return (
    <div className="p-4">
    <ToastContainer />
    <h2 className="text-lg font-semibold mt-10 ml-4 sm:ml-10 md:ml-28">Xammala əlavə et!</h2>
    <div>
      <form
        onSubmit={formik.handleSubmit}
        className="space-y-4 pb-16 mt-8 ml-2 sm:ml-10 max-w-full sm:max-w-[450px]"
      >
        <div>
          <label className="block mb-1" htmlFor="name">Adı</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="quantity">Miqdar</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            onChange={formik.handleChange}
            value={formik.values.quantity}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="unit">Vahid</label>
          <select
            id="unit"
            name="unit"
            onChange={formik.handleChange}
            value={formik.values.unit}
            className="w-full border px-2 py-1"
          >
            {category.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4 rounded w-full sm:w-auto">
          Saxla
        </button>
      </form>
  
      {/* Table */}
      <div className="mt-10 ml-2 sm:ml-16">
  <h3 className="text-lg font-semibold mb-4">Mövcud xammallar</h3>

  {/* Desktop Table */}
  <div className="hidden sm:block overflow-x-auto">
    <table className="min-w-[600px] w-full text-left border rounded bg-gray-50 table-fixed">
      <thead className="border-b border-gray-300 bg-gray-100">
        <tr>
          <th className="p-3 font-semibold w-[30%]">Adı</th>
          <th className="p-3 font-semibold w-[20%]">Miqdar</th>
          <th className="p-3 font-semibold w-[20%]">Vahid</th>
          <th className="p-3 font-semibold w-[30%] ml-36">Əməliyyatlar</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {rawMaterials.map((item, index) => (
          <tr key={item.id || index} className="bg-white border-b border-gray-300">
            <td className="p-3 truncate">
              {editId === item.id ? (
                <input
                  type="text"
                  value={editedValues.name}
                  onChange={(e) =>
                    setEditedValues({ ...editedValues, name: e.target.value })
                  }
                  className="border px-2 py-1 w-full text-sm"
                />
              ) : (
                item.name
              )}
            </td>
            <td className="p-3 truncate">
          {editId === item.id ? (
  <input
    type="number"
    value={editedValues.quantity}
    onChange={(e) =>
      setEditedValues({ ...editedValues, quantity: e.target.value })
    }
    className="border px-2 py-1 w-full text-sm"
  />
) : (
  item.stock?.quantity || "—"
)}

            </td>
            <td className="p-3 truncate">
              {editId === item.id ? (
                <select
                  value={editedValues.unit}
                  onChange={(e) =>
                    setEditedValues({ ...editedValues, unit: e.target.value })
                  }
                  className="border px-2 py-1 w-full text-sm"
                >
                  {category.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              ) : (
                category.find((cat) => cat.id === item.unit)?.label || "Naməlum"
              )}
            </td>
         
          </tr>
        ))}
        {rawMaterials.length === 0 && (
          <tr>
            <td colSpan="4" className="text-center py-4 text-gray-500">
              Heç bir xammal tapılmadı.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Mobile Card List */}
  <div className="sm:hidden space-y-4">
    {rawMaterials.length === 0 && (
      <div className="text-center text-gray-500">Heç bir xammal tapılmadı.</div>
    )}
    {rawMaterials.map((item, index) => (
      <div
        key={item.id || index}
        className="border rounded-lg p-4 bg-white shadow-sm space-y-2"
      >
        <div>
          <span className="font-semibold">Adı: </span>
          {editId === item.id ? (
            <input
              type="text"
              value={editedValues.name}
              onChange={(e) =>
                setEditedValues({ ...editedValues, name: e.target.value })
              }
              className="border px-2 py-1 w-full text-sm"
            />
          ) : (
            item.name
          )}
        </div>
        <div>
          <span className="font-semibold">Miqdar: </span>
          {editId === item.id ? (
            <input
              type="number"
              value={editedValues.quantity}
              onChange={(e) =>
                setEditedValues({ ...editedValues, quantity: e.target.value })
              }
              className="border px-2 py-1 w-full text-sm"
            />
          ) : (
            item.quantity
          )}
        </div>
        <div>
          <span className="font-semibold">Vahid: </span>
          {editId === item.id ? (
            <select
              value={editedValues.unit}
              onChange={(e) =>
                setEditedValues({ ...editedValues, unit: e.target.value })
              }
              className="border px-2 py-1 w-full text-sm"
            >
              {category.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          ) : (
            category.find((cat) => cat.id === item.unit)?.label || "Naməlum"
          )}
        </div>
        <div className="flex gap-2 pt-2">
          {editId === item.id ? (
            <button
              onClick={() => handleUpdate(item.id)}
              className="rounded px-3 py-1 bg-green-500 text-white text-sm w-full"
            >
              Yadda saxla
            </button>
          ) : (
            <button
              onClick={() => handleEdit(item)}
              className="rounded px-3 py-1 bg-blue-500 text-white text-sm w-full"
            >
              Düzəliş et
            </button>
          )}
          <button
            onClick={() => handleDelete(item.id)}
            className="rounded px-3 py-1 bg-red-600 text-white text-sm w-full"
          >
            Sil
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

    </div>
  </div>
  
  );
};

export default AddWarehouseProduct;
