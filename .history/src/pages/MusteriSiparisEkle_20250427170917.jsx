import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AccessDenied from "../components/AccessDenied";
import AlertSuccess from "../components/Alertsuccess";
import { base_url, img_url } from "../api/index";
import { Helmet } from "react-helmet";
import DontActiveAcount from "../components/DontActiveAcount";
import HesabKesAll from "../components/masasiparis/HesabKesAll";
import OncedenPopop from "../components/masasiparis/OncedenPopop";
import FilterButton from "../components/ui/FilterBtn";
import TableRow from "../components/ui/TableRow";
import Error from "../components/Error";
import TotalPriceHesab from "../components/masasiparis/TotalPriceHesab";
import { setFormattedOrder  } from "../redux/orderSlice";
import { useDispatch } from 'react-redux';
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function MusteriSiparisEkle() {
  const { id } = useParams(); // Get the order ID from the URL
  const [urunType, setUrunType] = useState(0);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [stockGroups, setStockGroups] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [orderStocks, setOrderStocks] = useState([]);
  const fis = localStorage.getItem("fisYazisi");
  //   const [totalPrice, setTotalPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState({}); // Default total price as a number
  const navigate = useNavigate();
  const [odersIdMassa, setOrdersIdMassa] = useState({});
  const [oncedenOdePopop, setoncedenodePopop] = useState(false);
  const [refreshFetch, setrefreshfetch] = useState(false);
  const [HesabKes, setHesabKes] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [ActiveUser, setActiveUser] = useState(false);
  const [handleModalMetbex, setHandleModal] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [orderModal, setNoOrderModal] = useState(false);
  const [modalId, setModalId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({
    id: null,
    name: "",
    price: 0,
    quantity: 1,
  });
  const [modalData, setModalData] = useState({
    name: "",
    desc: "",
    price: "",
  });
  const [oneProduct, setOneProduct] = useState(0);

  console.log("orderStocks",orderStocks);
  
  const closeModal = () => {
    setNoOrderModal(false);
  };
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
        // setAccessDenied(true); // Set access denied if response status is 403
      } else {
        console.error("Error loading customers:", error);
      }
    }
  };

  const fetchStocks = async (groupId) => {
    try {
      const response = await axios.get(`${base_url}/stocks`, {
        ...getHeaders(),
        params: groupId === 0 ? {} : { stock_group_id: groupId },
      });
      setStocks(response.data);
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

  const handleDeleteOrder = async () => {
    try {
      await axios.delete(`${base_url}/quick-orders/${id}`, getHeaders());
      navigate("/siparisler");
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
        console.error("Error deleting order:", error);
      }
    }
  };
  const dispatch = useDispatch();
  const fetchCustomerInfo = async () => {
  
    try {
      const response = await axios.get(
        `${base_url}/quick-orders/${id}`,
        getHeaders()
      );
      const { name, phone, address, order } = response.data;
      setOrdersIdMassa({
        id: response.data.order.id,
        total_price: response.data.order.total_price,
        total_prepayment: response.data.order.total_prepayment,
      });
      const total = response.data.order.total_price;
      const total_prepare = response.data.order.total_prepayment ?? 0;
      const kalanMebleg = total - total_prepare;
      setTotalPrice({
        total: total,
        total_prepare: total_prepare,
        kalan: kalanMebleg,
      });

      // setCustomerInfo({ name, phone, address });

      // const filteredStocks = order.stocks.map((stock) => ({
      //   id: stock.id,
      //   name: stock.name,
      //   price: stock.total_price,
      //   quantity: stock.pivot.quantity,
      // }));

      const formattedOrder = {
        id: order.id,
        totalPrice: order.total_price,
        total_prepayment: order.total_prepayment,
        status: order.status,
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
      };

      // Bu məlumatı state-ə yükləyirik
      setOrderStocks([formattedOrder]); // Array olaraq təyin edirik

      const shareItems = formattedOrder.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));
      
      dispatch(setFormattedOrder({ id: formattedOrder.id, items: shareItems }));
 console.log("formattedOrder.id",formattedOrder.id);
 

      
      //   setTotalPrice(order.total_price);
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

  const replaceImage = (url) => {
    return `${img_url}/${url}`;
  };

  useEffect(() => {
    fetchStockGroups();
    if (id) {
      fetchCustomerInfo();
    }
  }, [id, refreshFetch]);

  useEffect(() => {
    fetchStocks(urunType);
    localStorage.setItem("urunType", urunType);
  }, [urunType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    });
  };

  const updateCustomerInfo = async () => {
    try {
      await axios.put(
        `${base_url}/quick-orders/${id}`,
        customerInfo,
        getHeaders()
      );
      setAlertSuccess(true);
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
        console.error("Error updating customer info:", error);
      }
    }
  };
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
                    <td>${item.quantity}</td>
                  
                    <td>${
                      item.count ? item.count * item.quantity : item.quantity
                    }</td>
                
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

  const handleAddSifaris = async (stockId, selectedProduct = null) => {
    try {
      await axios.post(
        `${base_url}/quick-orders/${id}/add-stock`,
        {
          stock_id: stockId,
          quantity: selectedProduct?.quantity ? selectedProduct.quantity : 1,
          detail_id: selectedProduct?.id || null,
        },
        getHeaders()
      );
      fetchCustomerInfo();
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

  const handleRemoveSifaris = async (
    stockId,
    pivot_id,
    quantity,
    increase_boolean
  ) => {
    try {
      await axios.post(
        `${base_url}/quick-orders/${id}/subtract-stock`,

        {
          stock_id: stockId,
          quantity: quantity || 1,
          pivotId: pivot_id,
          increase: increase_boolean,
        },
        getHeaders()
      );
      fetchCustomerInfo();
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
        console.error("Error removing stock from order:", error);
      }
    }
  };

  const handlePrint = () => {
    const printContent = `
    <html>
    <head>
      <title>Print Order</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .sub_con{
          border: 1px solid #000;
          padding:0 5px;
      
          width: 100%; max-width:700px; margin: auto;

        }
        .container { width: 100%; max-width: 650px; margin: auto;  }
        .header { text-align: center; margin-bottom: 20px; }
        .order-list { margin-bottom: 20px; }
        .order-list table { width: 100%; border-collapse: collapse; }
        .order-list table, .order-list th, .order-list td { border: 1px solid black;   border: 1px solid #000; }
        .order-list th, .order-list td { padding: 8px; text-align: left; }
        .footer { text-align: right; margin-top: 10px;   font-weight: 700; font-size:24px; }
        .fis {text-align: center; margin-top: 20px; margin-bottom:3px; }
        .order-list table thead tr th {
          font-weight: 700;
          border: 1px solid #000;
          background-color: #f4f4f4;
      }
      .header {
        text-align: center;
        margin-bottom: 5px;
     
    }
    .cem{
      font-size:20px;

    }
     
      </style>
    </head>
    <body>
  <div class="sub_con">
      <div class="container">
       
        <div class="order-list">
        <div class="header">
        <h1>Sifariş məlumatları</h1>
        <p><strong>Müşteri:</strong> ${customerInfo.name}</p>
        <p><strong>Telefon nömrəsi:</strong> ${customerInfo.phone}</p>
        <p><strong>Address:</strong> ${customerInfo.address}</p>
       
      
   
      
          </div>
          <table>
            <thead>
          

      
              <tr>
                <th>No</th>
                <th>Sifarişin adı</th>
                <th>Əd</th>
                <th>Set</th>
                <th>Qiy</th>
                <th>Məb</th>
              </tr>
            </thead>
            <tbody>
              ${orderStocks[0].items
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
        </div>
        <div class="footer">
        <div>
        <p class="cem">Cəm: ${totalPrice.total.toFixed(2)} Azn</p>
        ${
          totalPrice?.total_prepare && totalPrice.total_prepare !== 0
            ? `<p>Artıq ödənilib: ${totalPrice.total_prepare} AZN</p>
               <p>Qalıq: ${totalPrice.kalan.toFixed(2)} Azn</p>`
            : ""
        }
      </div>
       
        </div>
        <div class="fis">
          <strong>${fis}</strong>
        </div>
      </div>
      </div>
    </body>
  </html>
    `;

    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
        handleAddSifaris(selectedStock.id);
      }
    } else {
      console.warn("Stock not found for the given ID:", stockId);
    }
  };
  if (ActiveUser) return <DontActiveAcount onClose={setActiveUser} />;
  if (accessDenied) return <AccessDenied onClose={setAccessDenied} />;
  return (
    <>
      <Helmet>
        <title> Müştəri sifarişi əlavə edin | Smartcafe</title>
        <meta
          name="description"
          content="Restoran proqramı | Kafe - Restoran idarə etmə sistemi "
        />
      </Helmet>
   
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

      {alertSuccess && <AlertSuccess setAlertSuccess={setAlertSuccess} />}
      {oncedenOdePopop && (
        <OncedenPopop
          name={customerInfo?.name}
          odersIdMassa={odersIdMassa}
          setrefreshfetch={setrefreshfetch}
          setoncedenodePopop={setoncedenodePopop}
        />
      )}
      {HesabKes && (
        <HesabKesAll
          orderStocks={orderStocks}
          setHesabKes={setHesabKes}
          tableName={customerInfo?.name}
          orderId={odersIdMassa}
          totalAmount={totalPrice.kalan}
        />
      )}
    </>
  );
}

export default MusteriSiparisEkle;
