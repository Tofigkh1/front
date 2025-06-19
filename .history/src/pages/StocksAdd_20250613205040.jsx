

import React, { useState, useEffect } from "react";
import axios from "axios";
import AddStok from "../components/AddStok";
import StokGruplari from "../components/StokGruplari";
import EditStok from "../components/EditStok";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AccessDenied from "../components/AccessDenied";
import { base_url } from "../api/index";
import { Helmet } from "react-helmet";
import ScreenPassword from "../components/ScreenPassword";
import StocksSetAdd from "../components/StocksSetAdd"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
};

function Stok() {
  const [selectedCat, setSelectedCat] = useState(0);
  const [addStok, setAddStok] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [groups, setGroups] = useState([]);
  const [editGroupid, setEditGroupid] = useState(null);
  const [items, setItems] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [selectedRawMaterials, setSelectedRawMaterials] = useState([
    { id: "", quantity: 1, name: "" },
  ]);
  console.log("selectedRawMaterials", selectedRawMaterials);

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
  console.log("items", items);

  const [accessDenied, setAccessDenied] = useState(false);
  const [ActiveUser, setActiveUser] = useState(false);
  console.log("ActiveUser", ActiveUser);


  useEffect(() => {
    if (rawMaterials && rawMaterials.length > 0) {
      const formatted = rawMaterials.map(raw => ({
        id: String(raw.id),
        quantity: parseFloat(raw.pivot?.quantity || '1'),
        name: raw.name
      }));
      setSelectedRawMaterials(formatted);
    }
  }, [rawMaterials]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `${base_url}/stock-groups`,
          getAuthHeaders()
        );
        setGroups(response.data);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          if (
            error.response.data.message ===
            "User does not belong to any active restaurant."
          ) {
            setActiveUser(true);
          } else if (error.response.data.message === "Forbidden") {
            setAccessDenied(true);
          }
        } else {
          console.error("Error loading customers:", error);
        }
      }
    };



    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `${base_url}/stock-sets`,
          getAuthHeaders()
        );
        setItems(response.data);
        console.log(response.data, "stok");
      } catch (error) {
        console.error("Error fetching items", error);
      }
    };

    fetchGroups();
    fetchItems();
  }, [showPopup, addStok]);

  const handleGroupClick = (groupId) => {
    setSelectedCat(groupId);
  };

  const handleDetailsClick = (item) => {
    setDetailsItem(item);
    setShowDetails(true);
  };


  const handleDeleteItem = async () => {
    if (!detailsItem) return;

    try {
      await axios.delete(
        `${base_url}/stocks/${detailsItem.id}`,
        getAuthHeaders()
      );
      setItems(items.filter((item) => item.id !== detailsItem.id));
      setShowDetails(false);
      setDetailsItem(null);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        if (
          error.response.data.message ===
          "User does not belong to any active restaurant."
        ) {
          setActiveUser(true);
        } else if (error.response.data.message === "Forbidden") {
          setAccessDenied(true);
        }
      } else {
        console.error("Error deleting item", error);
      }
    }
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setShowEditPopup(true);
    setShowDetails(false);
  };

  const handleUpdateItem = () => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `${base_url}/stocks`,
          getAuthHeaders()
        );
        setItems(response.data);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          if (
            error.response.data.message ===
            "User does not belong to any active restaurant."
          ) {
            setActiveUser(true);
          }
        } else {
          console.error("Error loading customers:", error);
        }
      }
    };

    fetchItems();
  };

  const handleCheckboxChange = async (item) => {
    const { image, ...updatedFormData } = {
      ...item,
      order_start: item.order_start ? item.order_start.slice(0, 5) : null,
      order_stop: item.order_stop ? item.order_stop.slice(0, 5) : null,
      show_on_qr: !item.show_on_qr,
    };

    try {
      await axios.put(
        `${base_url}/stocks/${item.id}`,
        updatedFormData,
        getAuthHeaders()
      );
      setItems(
        items.map((i) =>
          i.id === item.id ? { ...i, show_on_qr: !i.show_on_qr } : i
        )
      );
    } catch (error) {
      console.error("Error updating item", error);
    }
  };



  const filteredItems =
    selectedCat === 0
      ? items
      : items.filter((item) => item.stock_group_id === selectedCat);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredItems.map((item) => ({
        Adı: item.name,
        Stok: item.amount,
        "Satış qiyməti": item.price,
        "Qr Menü": item.show_on_qr ? "Evet" : "Hayır",
        Grup: groups.find((group) => group.id === item.stock_group_id)?.name,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stocks");
    XLSX.writeFile(wb, "stocks.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Stocks Report", 14, 16);

    const tableData = filteredItems.map((item) => [
      item.name,
      item.amount,
      item.price,
      item.show_on_qr ? "Evet" : "Hayır",
      groups.find((group) => group.id === item.stock_group_id)?.name,
    ]);

    doc.autoTable({
      head: [["Adı", "Stok", "Satış qiyməti", "Qr Menü", "Grup"]],
      body: tableData,
      startY: 30,
    });

    doc.save("stocks.pdf");
  };

  useEffect(() => {
    const fetchRawMaterials = async () => {
      if (detailsItem) {
        try {
          const response = await axios.get(
            `${base_url}/stocks/${detailsItem.id}/raw-materials`,
            getAuthHeaders() // DİKKAT: getAuthHeaders() kullanıyoruz
          );
          setRawMaterials(response.data);
        } catch (error) {
          console.error("Xammal məlumatları yüklənərkən xəta:", error);
        }
      }
    };
    fetchRawMaterials();
  }, [detailsItem]);




  //   if (ActiveUser) return <DontActiveAcount onClose={setActiveUser} />;
  if (accessDenied) return <AccessDenied onClose={setAccessDenied} />;

  return (
    <>
      <ScreenPassword />
      <Helmet>
        <title>Anbar | Smartcafe</title>
        <meta
          name="description"
          content="Restoran proqramı | Kafe - Restoran idarə etmə sistemi "
        />
      </Helmet>
 
      {showEditPopup && editItem && (
        <EditStok
          item={editItem}
          onClose={() => setShowEditPopup(false)}
          onUpdate={handleUpdateItem}
          rawMaterials={rawMaterials}
          detailsItem={detailsItem}
        />
      )}
    </>
  );
}

export default Stok;