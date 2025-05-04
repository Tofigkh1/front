import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import OncedenOde from "../components/OncedenOde";
import AccessDenied from "../components/AccessDenied";
import { base_url, img_url } from "../api/index";
import { Helmet } from "react-helmet";
import HesabKesAll from "../components/masasiparis/HesabKesAll";
import TableRow from "../components/ui/TableRow";
import Error from "../components/Error";
import TotalPriceHesab from "../components/masasiparis/TotalPriceHesab";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
import { fetchTableOrderStocks } from '../redux/stocksSlice';


// Helper function to get headers
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function MasaSiparis() {
  const { id } = useParams(); // Get the table ID from URL parameters
  const [urunType, setUrunType] = useState(0); // Default to "Hamısı"
  const [stockGroups, setStockGroups] = useState([]);
  const [stocks, setStocks] = useState([]);
  console.log("stocks",stocks);
  
  const [tableName, setTableName] = useState(""); // Default table name
  const [totalPrice, setTotalPrice] = useState({}); // Default total price as a number
  const [orderDetails, setOrderDetails] = useState([]); // Details of the table's orders
  const [odersIdMassa, setOrdersIdMassa] = useState({});
  const [refreshFetch, setRefreshFetch] = useState(false);
  const [oncedenodePopop, setOncedenodePopop] = useState(false);
  const [HesabKes, setHesabKes] = useState(false);
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);
  const [role, setrole] = useState(localStorage.getItem("role"));
  const fis = localStorage.getItem("fisYazisi");
  const restoranName = localStorage.getItem("restoran_name");
  const [orderModal, setNoOrderModal] = useState(false);
  const [ActiveUser, setActiveUser] = useState(false);
  const [oneProduct, setOneProduct] = useState(0);
  const [modalId, setModalId] = useState(null);
  const [handleModalMetbex, setHandleModal] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);

  const [modalData, setModalData] = useState({
    name: "",
    desc: "",
    price: "",
  });


  

  const [selectedProduct, setSelectedProduct] = useState({
    id: null,
    name: "",
    price: 0,
    quantity: 1,
  });
  // Fetch stock groups from API
  const fetchStockGroups = async () => {
    try {
      const response = await axios.get(
        `${base_url}/stock-groups`,
        getHeaders()
      );
      setStockGroups(response.data);
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message ===
          "User does not belong to any  active restaurant."
      ) {
        setActiveUser(true); // Set access denied if response status is 403
      }
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message === "Forbidden"
      ) {
      
      } else {
        console.error("Error loading customers:", error);
      }
    }
  };
  const dispatch = useDispatch();
  // Fetch stocks from API with optional filter
  const fetchStocks = async (groupId) => {
    try {
      const response = await axios.get(`${base_url}/stocks`, {
        ...getHeaders(),
        params: groupId === 0 ? {} : { stock_group_id: groupId }, // No filter if urunType is 0
      });
      setStocks(response.data);
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message ===
          "User does not belong to any  active restaurant."
      ) {
        setActiveUser(true); 
      }
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message === "Forbidden"
      ) {
     
      } else {
        console.error("Error loading customers:", error);
      }
    }
  };
  // Fetch table orders
  const fetchTableOrders = async () => {
    try {
      const response = await axios.get(
        `${base_url}/tables/${id}/order`,
        getHeaders()
      );
console.log("responseMasaSiparis",response);

     
      
      const orders = response.data.table.orders;
      console.log("orders",orders);
      
      setTableName(response.data.table.name);
      setOrdersIdMassa({
        id: response.data.table.orders[0].order_id,
        total_price: response.data.table.orders[0].total_price,
        total_prepayment: response.data.table.orders[0].total_prepayment,
      });
      const formattedOrders = orders.map((order) => ({
        totalPrice: order.total_price,
        total_prepayment: order.total_prepayment,
        items: order.stocks.map((stock) => ({
          id: stock.id,
          name: stock.name,
          quantity: stock.quantity,
          price: stock.price,
          pivot_id: stock.pivot_id,
          unit: stock.detail?.unit,
          count: stock.detail?.count,
          detail_id: stock.detail,
        })),
      }));

      // Flatten items and update state
      const allItems = formattedOrders.flatMap((order) => order.items);
      setOrderDetails(allItems);
      console.log("allItems",allItems);
      // Calculate total price
      const total = formattedOrders.reduce((acc, order) => order.totalPrice, 0);
      const total_prepare = formattedOrders.reduce(
        (acc, order) => order.total_prepayment,
        0
      );
      const kalanMebleg = total - total_prepare;
      setTotalPrice({
        total: total,
        total_prepare: total_prepare,
        kalan: kalanMebleg,
      });

      console.log("response",response);
      
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message ===
          "User does not belong to any  active restaurant."
      ) {
        setActiveUser(true); // Set access denied if response status is 403
      }
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message === "Forbidden"
      ) {
        // setAccessDenied(true); // Set access denied if response status is 403
      } else {
        console.error("Error loading customers:", error);
      }
    }
    
  };

  

  useEffect(() => {
    dispatch(fetchTableOrderStocks(id));
  }, [id, dispatch]);



  console.log("id",id);
  const { allItems, orders, loading, error } = useSelector((state) => state.stocks);




// const tableOrders = useSelector((state) => state.stocks.tableOrders);
// const loading = useSelector((state) => state.stocks.loading);
// const error = useSelector((state) => state.stocks.error);


console.log("tableData",allItems);
console.log("orders",orders);


  // Delete orders
  const handleDeleteMasa = async () => {
    try {
      await axios.delete(`${base_url}/tables/${id}/cancel-order`, getHeaders());
      setRefreshFetch(!refreshFetch);
      window.location.reload();
      navigate("/masalar");
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message ===
          "User does not belong to any  active restaurant."
      ) {
        setActiveUser(true); // Set access denied if response status is 403
      }
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message === "Forbidden"
      ) {
        setAccessDenied(true); // Set access denied if response status is 403
      } else {
        console.error("Error deleting masa:", error);
      }
    }
  };

  
  const handleCustomModal = (stockId) => {
    const selectedStock = stocks.find((stock) => stock.id === stockId.id);

    if (selectedStock) {
      if (selectedStock.details && selectedStock.details.length > 0) {
        setSelectedProduct({
          id: null,
          name: "",
          price: 0,
          quantity: 1,
        });

        setModalId(selectedStock?.id);
        setModalData({
          name: selectedStock?.name,
          desc: selectedStock?.description,
          price: selectedStock?.price,
        });
        setNoOrderModal(true);
      } else {
        handleAddStock(selectedStock.id);
      }
    } else {
      console.warn("Stock not found for the given ID:", stockId);
    }
  };

  const closeModal = () => {
    setNoOrderModal(false);
  };
  const replaceImage = (url) => {
    return url ? `${img_url}/${url}` : "";
  };

  useEffect(() => {
    const storedUrunType = localStorage.getItem("urunType");
    if (storedUrunType) {
      setUrunType(Number(storedUrunType));
    }
    fetchStockGroups();
    fetchTableOrders();
  }, [id, refreshFetch]);

  useEffect(() => {
    fetchStocks(urunType);
    localStorage.setItem("urunType", urunType);
  }, [urunType]);

  
  const handleAddStock = async (stockId, selectedProduct = null) => {
    try {
      await axios.post(
        `${base_url}/tables/${id}/add-stock`,
        {
          stock_id: stockId,
          quantity: selectedProduct?.quantity ? selectedProduct.quantity : 1,
          detail_id: selectedProduct?.id || null,
        },
        getHeaders()
      );
      toast.info("Məhsul əlavə olundu", {
        position: toast.POSITION?.TOP_RIGHT || "top-right",
        autoClose: 1000,
        style: {
          fontSize: "14px",
          padding: "8px 12px",
          width: "70%", //
          "@media (max-width: 768px)": {
            width: "70%",
          },
        },
      });
      fetchTableOrders();
      setNoOrderModal(false);
    } catch (error) {
      <Error
        error={error}
        setActiveUser={setActiveUser}
        setAccessDenied={setAccessDenied}
        setNoOrderModal={setNoOrderModal}
      />;
    }
  };


  const handleRemoveStock = async (
    stockId,
    pivot_id,
    quantity,
    increase_boolean
  ) => {
    try {
      await axios.post(
        `${base_url}/tables/${id}/subtract-stock`,
        {
          stock_id: stockId,
          quantity: quantity || 1,
          pivotId: pivot_id,
          increase: increase_boolean,
        },
        getHeaders()
      );
      fetchTableOrders();
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message ===
          "User does not belong to any  active restaurant."
      ) {
        setActiveUser(true);
      }
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message === "Forbidden"
      ) {
        setAccessDenied(true);
      } else {
        console.error("Error removing stock from order:", error);
      }
    }
  };



  const handlePrint = () => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()}`;
    const formattedTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    const printContent = `
    <html>
      <head>
        <title>Print Order</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .invoice {
            width: 100mm; /* Fatura kağıdı genişliği */
            margin: 5px auto;
            padding: 1px;
            
            box-sizing: border-box;
            font-size: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 5px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
        }
        .header h1 {
          text-transform: uppercase;
      }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }
        .table th, .table td {
            border: 1px solid #000;
            padding: 3px;
            text-align: left;
        }
        .table th {
            background-color: #f4f4f4;
        }
        .total {
            text-align: right;
            font-size: 17px;
            font-weight: bold;
            margin-top: 5px;
        }
        .cem{
          font-size: 18px;
        }
        .print-button {
            display: block;
            margin: 10px auto;
            padding: 5px 15px;
            background-color: #28a745;
            color: #fff;
            border: none;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
            text-align: center;
        }
        .print-button:hover {
            background-color: #218838;
        }
        @media print {
            .print-button {
                display: none; /* Yazdırmada buton gizlenir */
            }
            body {
                margin: 0;
            }
            .table th, .table td {
                border: 1px solid black; /* Yazdırmada net çerçeve */
            }
            .table th {
                background-color: #ffffff !important; 
                -webkit-print-color-adjust: exact;
            }
            .invoice {
              border: none; /* Yazdırma sırasında gereksiz dış çerçeve kaldırılır */
            }
        }
    </style>
      </head>
      <body>
      <div class="invoice">
      <div class="header">
      <h1> ${restoranName}</h1>
          <h2> ${tableName}</h2>
     
      </div>
      <table class="table">
          <thead>
              <tr>
                  <th>No</th>
                  <th>Sifarişin adı</th>
                  <th>Miq.</th>
                  <th>Set.</th>
                  <th>Qiymət</th>
                  <th>Məbləğ</th>
              </tr>
          </thead>
          <tbody>
            
              ${orderDetails
                ?.map(
                  (item, index) => `
                    <tr key="${item.id}">
                    <td>${index + 1}</td>
                    <td>
                    ${item.name} <br/>${item?.count ? `${item.unit || ""}` : ""}
                  </td>
                  
                      <td>${
                        item.count ? item.count * item.quantity : item.quantity
                      }</td>
                      <td>${item?.count ? item.quantity : 0}</td>
                      <td>${(item.price / item.quantity).toFixed(2)} </td>
                      <td>${(
                        item.quantity *
                        (item.price / item.quantity)
                      ).toFixed(2)} </td>
                    </tr>
                  `
                )
                .join("")}
          </tbody>
      </table>
      <div class="total">
          <div>
              <p class="cem">CƏM: ${totalPrice.total.toFixed(2)} Azn</p>
              ${
                totalPrice?.total_prepare && totalPrice.total_prepare !== 0
                  ? `<p>Artıq ödənilib: ${totalPrice.total_prepare} AZN</p>
                     <p>Qalıq: ${totalPrice.kalan.toFixed(2)} Azn</p>`
                  : ""
              }
            </div>
            <strong>${fis}</strong>
      </div>
  </div>
  
      </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position: absolute;
    width: 0;
    height: 0;
    border: none;
    visibility: hidden;
  `;

  document.body.appendChild(iframe);

  
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };



  // if (ActiveUser) return <DontActiveAcount onClose={setActiveUser}/>;
  if (accessDenied) return <AccessDenied onClose={setAccessDenied} />;
  const handleCheckboxChange = (item, e) => {
    const isChecked = e.target.checked;
    setCheckedItems((prev) => {
      if (isChecked) {
        return [...prev, item];
      } else {
        return prev.filter((i) => i.id !== item.id);
      }
    });
  };
  const handleIngredientChange = (index, value) => {
    setCheckedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, customIngredient: value } : item
      )
    );
  };
  const kicthenDataSend = () => {
    const kitchenContent = `
    <html>
      <head>
        <title>Metbex Sifarişi</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .invoice {
            width: 100mm; /* Fatura kağıdı genişliği */
            margin: 5px auto;
            padding: 3px;
            border: 1px solid #000;
            box-sizing: border-box;
            font-size: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 5px;
        }
        .header h1 {
            margin: 0;
            font-size: 16px;
            text-transform: uppercase;

        }
        .header h2 {
       
          text-transform: uppercase;

      }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }
        .table th, .table td {
            border: 1px solid #000;
            padding: 3px;
            text-align: left;
        }
        .table th {
            background-color: #f4f4f4;
        }
        .print-button {
            display: none; /* Yazdırmada buton gizlenir */
        }
        </style>
      </head>
      <body>
      <div class="invoice">
        <div class="header">
          <h1>${restoranName}</h1>
          <h2>${tableName} (Metbex üçün)</h2>
        </div>
        <table class="table">
          <thead>
            <tr>
            <th>No</th>
            <th>Sifarişin adı</th>
          
            <th>Miq.</th>
            <th>Set.</th>
            <th>Tərkib</th>
         
        
         
            </tr>
          </thead>
          <tbody>
            ${checkedItems
              ?.map(
                (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td className=" py-2">
                      ${item?.name}
                      ${
                        item?.detail_id?.unit
                          ? ` (${item?.detail_id?.unit})`
                          : ""
                      }
                    </td>
                  
                    <td>${
                      item.count ? item.count * item.quantity : item.quantity
                    }</td>
                    <td>${item?.count ? item.quantity : 0}</td>
                    <td>${item.customIngredient || "Yoxdur"}</td>
                  
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      </body>
    </html>
    `;

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.open();
    printWindow.document.write(kitchenContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    setHandleModal(false);
  };
console.log("orderDetails",orderDetails);


  return (
    <>
     
      <Helmet>
        <title>Masaların sifarişi | Smartcafe</title>
        <meta
          name="description"
          content="Restoran proqramı | Kafe - Restoran idarə etmə sistemi "
        />
      </Helmet>
      <section className="p-6 flex flex-col  lg:flex-row gap-6">
        <div className="border rounded-lg     overflow-x-scroll w-full lg:w-[43%] bg-gray -50 p-4 flex-2">
          <div className="flex items-center justify-between mb-4">
            <Link
              className="bg-blue-600 text-white py-2 px-4 rounded flex items-center gap-2"
              to="/masalar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-chevron-double-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                ></path>
                <path
                  fillRule="evenodd"
                  d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                ></path>
              </svg>
              Masalar
            </Link>
            {checkedItems.length > 0 && (
              <button
                onClick={() => setHandleModal(true)}
                className="bg-blue-400 text-white py-2 px-4 rounded flex items-center gap-2"
              >
                Mətbəxə yazdır
              </button>
            )}

            <h2 className="text-xl font-semibold">{tableName}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200 rounded-md shadow-md table-auto">
              <thead className="bg-gray-100 border-b border-gray-300">
                <TableRow
                  columns={[
                    { label: "Mətbəx ", className: "p-3 font-semibold" },

                    { label: "Adı", className: "p-3 font-semibold" },
                    { label: "Miktar", className: "p-3 font-semibold" },
                    { label: "Fiyat", className: "p-3 font-semibold" },

                    { label: "Sil", className: "p-3 font-semibold" },
                  ]}
                />
              </thead>
              <tbody>
                {orderDetails.map((item, index) => (
                  <tr key={`${item.id}-${index}`} className="border-b ">
                    <td className=" grid place-items-center">
                      <input
                        type="checkbox"
                        className="w-6 h-4 mt-6"
                        onChange={(e) => handleCheckboxChange(item, e)}
                      />
                    </td>

                    {item?.count ? (
                      <>
                        <td className="p-5">
                          {item.name} {item.count}{" "}
                          <span className="mx-2">{item.unit}</span>{" "}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                handleRemoveStock(
                                  item.id,
                                  item?.pivot_id,
                                  item.quantity,
                                  true
                                )
                              }
                              className="bg-red-500 text-white text-lg py-1 px-2 rounded-l focus:outline-none"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              className="border-t border-b py-1 px-2 text-center w-10 text-lg"
                              readOnly
                            />
                            <button
                              onClick={() => {
                                handleAddStock(item.id, item?.detail_id);
                              }}
                              className="bg-green-500 text-lg text-white py-1 px-2 rounded-r focus:outline-none"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-5">{item.name}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                handleRemoveStock(
                                  item.id,
                                  item?.pivot_id,
                                  item.quantity,
                                  true
                                )
                              }
                              className="bg-red-500 text-white py-1 px-1 rounded-l focus:outline-none"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              className="border-t border-b py-1 text-center w-16 text-lg"
                              readOnly
                            />
                            <button
                              onClick={() => handleAddStock(item.id)}
                              className="bg-green-500 text-white py-1 px-2 rounded-r focus:outline-none"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </>
                    )}

                    <td className="p-3 text-right">
                      {Number.isFinite(Number(item.price))
                        ? Number(item.price).toFixed(2)
                        : "0.00"}{" "}
                      ₼
                    </td>

                    <td
                      onClick={() =>
                        handleRemoveStock(
                          item.id,
                          item?.pivot_id,
                          item.quantity
                        )
                      }
                      className="p-3 text-red-500 cursor-pointer text-center"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {role !== "waiter" && (
            <div className="flex flex-col gap-4 mt-4">
              {totalPrice.total ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Ön ödeme:</span>
                    <input
                      type="text"
                      value={totalPrice.total_prepare}
                      readOnly
                      className="border rounded-l p-2 text-right w-20"
                    />
                    <button
                      onClick={() => setOncedenodePopop(true)}
                      className="bg-green-500 text-white py-1 px-2 rounded-r focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Toplam:</span>
                    <div className="flex items-center">
                      <div className="border font-medium py-1 px-2 rounded-l bg-gray-100">
                        ₼
                      </div>
                      <div className="border border-l-0 rounded-r p-2 w-32 text-right bg-gray-100">
                        {totalPrice.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-semibold">
                      Artıq ödənilib :
                    </span>
                    <div className="flex items-center">
                      <div className="border font-medium py-1 px-2 rounded-l bg-gray-100">
                        ₼
                      </div>
                      <div className="border border-l-0 rounded-r p-2 w-32 text-right bg-gray-100">
                        {totalPrice.total_prepare}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-semibold">Qalıq :</span>
                    <div className="flex items-center">
                      <div className="border font-medium py-1 px-2 rounded-l bg-gray-100">
                        ₼
                      </div>
                      <div className="border border-l-0 rounded-r p-2 w-32 text-right bg-gray-100">
                        {totalPrice.kalan.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                "Sifaris yoxdur"
              )}

              <TotalPriceHesab
                totalPrice={totalPrice?.total}
                setHesabKes={setHesabKes}
                handlePrint={handlePrint}
                handleDeleteMasa={handleDeleteMasa}
              />
            </div>
          )}
        </div>

        {/* Product Selection Section */}
        <div className="border w-full rounded-lg bg-gray-50 p-4 flex-1">
          <div className="flex flex-wrap gap-2  mb-4">
            <button
              onClick={() => setUrunType(0)}
              className={`p-2 btn-filter ${
                urunType === 0
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-200"
              }`}
            >
              Hamısı
            </button>
            {stockGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setUrunType(group.id)}
                className={`p-2 btn-filter ${
                  urunType === group.id
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-200"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
          <div className=" h-[800px]  overflow-y-scroll flex-1 ">
            <div className="grid grid-cols-2 sm:grid-cols-3 h-[200px]   md:grid-cols-3 lg:grid-cols-3 gap-4">
              {stocks.map((stock) => (
                <div
                  key={stock.id}
                  className="bg-white border rounded-lg p-4 shadow-md flex flex-col cursor-pointer"
                  onClick={() => handleCustomModal(stock)}
                >
                  <div className="w-full h-32 bg-gray-300 mb-2">
                    <img
                      src={replaceImage(stock.image)}
                      alt={stock.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <span className="block text-lg font-semibold">{` ${stock.price} ₼`}</span>
                    <p className="text-sm text-gray-600 truncate">
                      {stock.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {oncedenodePopop && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300 relative">
            <div className="bg-gray-200 p-4 flex justify-between items-center border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {tableName}
              </h3>
              <button
                onClick={() => setOncedenodePopop(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <OncedenOde
                odersId={odersIdMassa}
                setrefreshfetch={setRefreshFetch}
              />
            </div>
          </div>
        </div>
      )}
      {orderModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-xl font-semibold mb-4">{modalData?.name}</h3>
            <p className="text-sm font-semibold mb-4">
              Məhsul haqqında:
              <span className="text-xs">{modalData?.desc}</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Məhsulun qiymətini və sayını seçin
              </label>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => {
                  const selectedId = e.target.value;

                  const filteredStock = stocks.find(
                    (stock) => stock.id === modalId
                  );

                  if (filteredStock) {
                    const selectedItem = filteredStock.details.find(
                      (item) => item.id === Number(selectedId)
                    );

                    if (selectedItem) {
                      const oneProductCount =
                        selectedItem.price / selectedItem.count;

                      setOneProduct(oneProductCount);
                      setSelectedProduct({
                        id: selectedItem.id,
                        name: selectedItem.name || "",
                        price: selectedItem.price,
                        quantity: 1,
                      });
                    } else {
                      setSelectedProduct({
                        id: null,
                        name: "",
                        price: 0,
                        quantity: 1,
                      });
                    }
                  } else {
                    console.warn(
                      "Stock not found for the given modalId:",
                      modalId
                    );
                  }
                }}
              >
                <option value="">Məhsul əlavə et</option>
                {stocks
                  .filter((stock) => stock.id === modalId)
                  .flatMap((stock) =>
                    stock.details.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.count} {item.unit},{item.price} ₼
                      </option>
                    ))
                  )}
              </select>
            </div>

            <div className="flex items-center  mb-4">
              <button
                onClick={() =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    quantity: Math.max(1, prev.quantity - 1),
                  }))
                }
                className="border hover:bg-slate-100 rounded-l px-3 py-2 text-lg"
              >
                -
              </button>
              <span className="px-4 text-lg">{selectedProduct?.quantity}</span>
              <button
                onClick={() => {
                  setSelectedProduct((prev) => ({
                    ...prev,
                    quantity: prev.quantity + 1,
                  }));
                  handleAddStock(selectedProduct.id, {
                    ...selectedProduct,
                    quantity: selectedProduct.quantity + 1,
                  });
                }}
                className="border hover:bg-slate-100 rounded-r px-3 py-2 text-lg"
              >
                +
              </button>
            </div>

            <p className="py-2">
              Qiyməti:{" "}
              {selectedProduct?.id == null
                ? (modalData.price * selectedProduct.quantity).toFixed(2)
                : (selectedProduct.price * selectedProduct.quantity).toFixed(
                    2
                  )}{" "}
              ₼
            </p>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  const filteredStock = stocks.find(
                    (stock) => stock.id === modalId
                  );
                  if (filteredStock) {
                    handleAddStock(filteredStock.id, selectedProduct);
                  } else {
                    console.warn("No valid stock with details available.");
                  }
                }}
                className="bg-green-500 hover:bg-green-800 text-white py-2 px-4 rounded"
              >
                Masaya əlavə et
              </button>
              <button
                onClick={closeModal}
                className=" hover:bg-red-800  rounded-lg bg-red-500 text-white hover:text-white py-2 px-4"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
      {handleModalMetbex && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white relative rounded-lg p-6 w-96">
            <button
              className="absolute right-4 top-2 bg-red-500 text-white rounded px-2 py-1"
              onClick={() => setHandleModal(false)}
            >
              X
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center">
              Xüsusi Sifarişlər
            </h3>

            <table className="w-full border border-gray-200 rounded-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Məhsul Adı</th>
                  <th className="border px-4 py-2 text-left">
                    Xüsusi İnqrediyent
                  </th>
                </tr>
              </thead>
              <tbody>
                {checkedItems?.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">
                      {item?.name}
                      {item?.detail_id?.unit && ` (${item?.detail_id?.unit})`}
                    </td>

                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="Xüsusi inqrediyent daxil edin"
                        value={item.customIngredient || ""}
                        onChange={(e) =>
                          handleIngredientChange(index, e.target.value)
                        }
                        className="border rounded w-full px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={kicthenDataSend}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Metbexe Göndər
            </button>
          </div>
        </div>
      )}

      {HesabKes && (
        <HesabKesAll
          setHesabKes={setHesabKes}
          tableName={tableName}
          orderId={odersIdMassa}
          totalAmount={totalPrice.kalan}
        />
      )}
    </>
  );
}

export default MasaSiparis;
