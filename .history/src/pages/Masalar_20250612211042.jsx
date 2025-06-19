import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import MasaAyarlari from "../components/MasaAyarlari";
import { Link, useParams } from "react-router-dom";
import AccessDenied from "../components/AccessDenied";
import { base_url } from "../api/index";
import { Helmet } from "react-helmet";
import { fetchTableOrderStocks } from "../redux/stocksSlice";
import { useDispatch, useSelector } from "react-redux";
// import ClipLoader from "react-spinners/ClipLoader";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const Masalar = () => {
  const [ActiveUser, setActiveUser] = useState(false);
  const [masaType, setMasaType] = useState(
    localStorage.getItem("masaType") || 0
  );
  const [showDetail, setShowDetail] = useState(null);
  const [masaAyarlar, setMasaAyarlar] = useState(false);
  const [groups, setGroups] = useState([]);
  const [tables, setTables] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [role, setrole] = useState(localStorage.getItem("role"));
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();
  const { allItems, orders, error } = useSelector((state) => state.stocks);

  console.log("id",id);
  console.log("tables",tables);
  
  const [tableColors, setTableColors] = useState({
    empty: "#ff0000",
    booked: "#834e4e",
  });


  const [tableItemData, setTableItemData] = useState({});
  // window.location.reload()
  // Fetch table groups from API
  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${base_url}/table-groups`,
        getHeaders()
      );
      setGroups(response.data);
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

    
  


  
  

  // Fetch tables from API with optional filter
  const fetchTables = async (groupId) => {
    try {
      setLoading(true); // başta yükleme başlat
      const response = await axios.get(`${base_url}/tables`, {
        ...getHeaders(),
        params: { table_group_id: groupId },
      });
  
      setTables(response.data.tables);
      setTableColors({
        empty:
          localStorage.getItem("empty_table_color") ||
          response.data.empty_table_color,
        booked:
          localStorage.getItem("booked_table_color") ||
          response.data.booked_table_color,
      });
    } catch (error) {
      console.error("Error loading tables:", error);
    } finally {
      setLoading(false); // her durumda yükleme biter
    }
  };
 

  
  

  
  // Fetch groups and tables on component mount
  useEffect(() => {
    fetchGroups();

    // Retrieve the stored masaType from localStorage, if available
    const storedMasaType = localStorage.getItem("masaType");
    if (storedMasaType) {
      setMasaType(Number(storedMasaType));
    }
  }, []);

  // Fetch tables whenever masaType changes
  useEffect(() => {
    fetchTables(masaType);
    // Save masaType to localStorage whenever it changes
    localStorage.setItem("masaType", masaType);
  }, [masaType]);





  console.log("tableData",allItems);
console.log("orders",orders);

  useEffect(() => {
    dispatch(fetchTableOrderStocks(id));
  }, [id, dispatch]);

  if (accessDenied) return <AccessDenied onClose={setAccessDenied} />;

  return (
    <>
   
      <Helmet>
        <title>Masalar | Smartcafe</title>
        <meta
          name="description"
          content="Restoran proqramı | Kafe - Restoran idarə etmə sistemi "
        />
      </Helmet>
      <section className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Button for "Hamısı" */}
          <button
            onClick={() => setMasaType(0)}
            className={`masa-type-btn ${
              masaType === 0
                ? "bg-blue-500 border-blue-500 text-white"
                : "bg-gray-300"
            }`}
          >
            Hamısı
          </button>
          {/* Buttons for each group */}
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setMasaType(group.id)}
              className={`masa-type-btn ${
                masaType === group.id
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {group.name}
            </button>
          ))}
          <button
            className="rounded py-2 px-4 border bg-white text-sm"
            onClick={() => setMasaAyarlar(true)}
          >
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>

        {/* Table display */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-5 gap-4">
    
        {tables.map((table) => (
            <div
              key={table.id}
              className={`relative rounded-lg overflow-hidden shadow-lg transition-transform duration-300 min-h-[150px] sm:min-h-[200px] lg:min-h-[150px] flex flex-col justify-center items-center p-4`}
              style={{
                backgroundColor: table.is_available
                  ? tableColors.empty
                  : tableColors.booked,
              }}
            >
              <Link
                className="w-full h-full flex flex-col justify-center items-center text-center"
                to={`/masa-siparis/${table.id}`}
              >
                <div className="space-y-2">
                  <h4 className="text-lg sm:text-xl lg:text-xl font-semibold">
                    {table.name}
                  </h4>
                  {table.total_price && (
                    <strong className="text-md sm:text-lg lg:text-xl">
                      ₼ {table.total_price >0 : ""} 
                    </strong>
                  )}
                </div>
              </Link>
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                {table.book_time && (
                  <span className="border text-xs rounded py-1 px-2 flex items-center gap-1 uppercase text-gray-800 hover:border-gray-800">
                    <i className="fa-regular fa-clock"></i> {table.book_time}
                  </span>
                )}
                {role !== "waiter" && (
                  <button
                    className="ml-auto py-1 px-2 bg-white border border-gray-300 rounded text-sm"
                    onClick={() => (
                      setShowDetail(table.id), setTableItemData(table)
                    )}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                )}
              </div>
            </div>
       
        ))}
        </div>
      </section>

      {showDetail != null && (
        <Modal
          type={true}
          groups={groups}
          tableItemData={tableItemData}
          setShowDetail={setShowDetail}
          _modalMain={"main"}
        />
      )}
      {masaAyarlar && <MasaAyarlari setMasaAyarlar={setMasaAyarlar} />}
    </>
  );
};

export default Masalar;
