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
    const [logs, setLogs] = useState([]);
  console.log("rawMaterials",rawMaterials);
const [showModal, setShowModal] = useState(false);
// const [explanationText, setExplanationText] = useState("");
// const [selectedItemId, setSelectedItemId] = useState(null);

const [modalAction, setModalAction] = useState(null);
const [modalItemId, setModalItemId] = useState(null);
const [modalQuantity, setModalQuantity] = useState("");
const [modalText, setModalText] = useState("");
const [logModalOpen, setLogModalOpen] = useState(false);
const [selectedLogs, setSelectedLogs] = useState([]);
const [selectedMaterialName, setSelectedMaterialName] = useState("");


console.log("rawMaterials",rawMaterials.id);
console.log("selectedLogs",selectedLogs);

  console.log("logs",logs);
  

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



  const handleModalSave = async () => {
  if (!modalItemId || !modalAction || !modalQuantity) return;

  const token = localStorage.getItem("token");
  const payload = {
    quantity: Number(modalQuantity),
    text: modalText
  };

  try {
    await axios.post(`${base_url}/raw-materials/${modalItemId}/${modalAction}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    toast.success(
      modalAction === "increase" ? "Miqdar artırıldı" : "Miqdar azaldıldı",
      {
        position: "top-right",
        autoClose: 1000
      }
    );

    // Reset & refresh
    setShowModal(false);
    setModalItemId(null);
    setModalAction(null);
    setModalQuantity("");
    setModalText("");
    fetchData();
  } catch (error) {
    console.error("Xəta:", error);
    toast.error("Xəta baş verdi. Yenidən yoxlayın.", {
      position: "top-right",
      autoClose: 1000
    });
  }
};

  const formik = useFormik({
    initialValues: {
      name: "",
      unit: "1",
    },
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem("token");
        const payload = {
          name: values.name,
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







const handleViewLogs = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/raw-materials/${id}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
console.log("responselogs",response);

      // Find the material name from rawMaterials
      const material = rawMaterials.find(item => item.id === id);
      setSelectedMaterialName(material?.name || "");
      
      setSelectedLogs(response.data.data);
      setLogModalOpen(true);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Error loading logs", {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };



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
        {/* <div>
          <label className="block mb-1" htmlFor="quantity">Miqdar</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            onChange={formik.handleChange}
            value={formik.values.quantity}
            className="w-full border px-2 py-1"
          />
        </div> */}
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
         <th className="p-3 font-semibold w-[30%] text-center">Əməliyyatlar</th>

        </tr>
      </thead>
      <tbody className="text-sm">
     {rawMaterials.map((item, index) => (
  <tr  onClick={() => handleViewLogs(item.id)} key={item.id || index} className="cursor-pointer bg-white border-b border-gray-300">
    {/* Ad (name) - redaktə edilə bilməz */}
    <td className="p-3 truncate">
      {item.name}
    </td>

    {/* Miqdar (quantity) - redaktə edilə bilər */}
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
        item.stock?.quantity || "yoxdur"
      )}
    </td>

    {/* Ölçü vahidi (unit) - redaktə edilə bilməz */}
    <td className="p-3 truncate">
      {category.find((cat) => cat.id === item.unit)?.label || "Naməlum"}
    </td>

    {/* Əməliyyatlar */}
    <td className="p-3">
 <div className="flex flex-wrap gap-2 justify-center">
  <button
    onClick={() => {
      setModalItemId(item.id);
      setModalAction("increase");
      setShowModal(true);
    }}
    className="bg-green-500 text-white px-3 py-1 rounded text-sm w-[80px]"
  >
    Artır
  </button>

  <button
    onClick={() => {
      setModalItemId(item.id);
      setModalAction("decrease");
      setShowModal(true);
    }}
    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm w-[80px]"
  >
    Azalt
  </button>

  <button
    onClick={() => handleDelete(item.id)}
    className="rounded px-3 py-1 bg-red-600 text-white text-sm w-[60px]"
  >
    Sil
  </button>


  {/* <button
  onClick={() => handleViewLogs(item.id)}
  className="bg-indigo-500 text-white px-3 py-1 rounded text-sm w-[70px]"
>
  Loglar
</button> */}


</div>
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


{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">
        {modalAction === "increase" ? "Miqdarı artır" : "Miqdarı azalt"}
      </h2>
      <input
        type="number"
        placeholder="Miqdar"
        value={modalQuantity}
        onChange={(e) => setModalQuantity(e.target.value)}
        className="w-full border px-3 py-2 mb-4"
      />
      <textarea
        placeholder="Qeyd (optional)"
        value={modalText}
        onChange={(e) => setModalText(e.target.value)}
        className="w-full border px-3 py-2 mb-4"
      ></textarea>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Ləğv et
        </button>
        <button
          onClick={handleModalSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Yadda saxla
        </button>
      </div>
    </div>
  </div>
)}


{logModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">{selectedMaterialName} üçün loglar</h2>
  {Array.isArray(logs) && logs.length > 0 ? (
  logs.map((log) => (
    <div key={log.id}>{log.text}</div>
  ))
) : (
  <p>Log tapılmadı</p>
)}
Veya:
      <div className="flex justify-end mt-4">
        <button
          onClick={() => setLogModalOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Bağla
        </button>
      </div>
    </div>
  </div>
)}


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
    item.stock?.quantity || "—"
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
