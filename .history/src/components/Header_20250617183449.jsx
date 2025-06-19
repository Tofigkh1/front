import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DateTimeDisplay from "./DateTimeDisplay";
import { connect } from "react-redux";
import { logOut } from "../action/MainAction";
import NewOrders from "./NewOrders";
import { base_url, img_url } from "../api/index";

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

const Header = ({ token, logOut }) => {
  const [kasaDropShow, setKasaDropShow] = useState(false);
  const [tanimDropShow, setTanimDropShow] = useState(false);
  const [profDropShow, setProfDropShow] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [meData, setMeData] = useState({});
  const [mobileTanimDropShow, setMobileTanimDropShow] = useState(false);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  const kasaRef = useRef(null);
  const tanimRef = useRef(null);
  const profRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    logo: null,
    name: "",
  });
  useEffect(() => {
    localStorage.setItem("restoran_name", formData?.name);
  }, [formData]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        `${base_url}/own-restaurants`,
        getAuthHeaders()
      );
      setFormData({
        logo: response.data.logo || null,
        name: response.data.name || "",
      });
    } catch (error) {
      console.error("Error fetching settings", error);
    }
  };

  const fetchMe = async () => {
    try {
      const response = await axios.get(`${base_url}/me`, getAuthHeaders());
      setMeData(response.data);
      const userRole = response.data.roles[0]?.name || "";
      setRole(userRole);
      localStorage.setItem("role", userRole);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchMe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kasaRef.current && !kasaRef.current.contains(event.target)) {
        setKasaDropShow(false);
      }
      if (tanimRef.current && !tanimRef.current.contains(event.target)) {
        setTanimDropShow(false);
      }
      if (profRef.current && !profRef.current.contains(event.target)) {
        setProfDropShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = async () => {
    await logOut();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setShowProfileOptions(false);
  };

  const handleProfileOptionsToggle = () => {
    setShowProfileOptions(!showProfileOptions);
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const replaceImage = (url) => {
    return url ? `${img_url}/${url}` : ""; // Ensure URL is valid
  };

  if (!token) {
    return null; // Ensure user is redirected or shown a message if not authenticated
  }

  return (
    <>
      <nav className="bg-white border-b py-2 px-4 flex items-center justify-between lg:justify-start">
        <div className="flex items-center">
          <button onClick={handleMobileMenuToggle} className="block lg:hidden">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          <h3 className="mr-5 text-base hidden lg:block">
            <Link to="/masalar">{meData.name}</Link>
          </h3>
        </div>

        <ul
          className={`flex gap-5 list-none items-center mr-auto lg:flex ${
            mobileMenuOpen ? "block" : "hidden"
          } lg:block`}
        >
          {role !== "waiter" && (
            <>
              <li>
                <Link className="nav-link" to="/masalar">
                  <i className="fa-solid fa-utensils"></i> Masalar
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/siparisler">
                  <i className="fa-solid fa-burger"></i>Sifarişlər
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/musteriler">
                  <i className="fa-regular fa-user"></i>Müştərilər
                </Link>
              </li>
              <li
                ref={kasaRef}
                onClick={() => setKasaDropShow(!kasaDropShow)}
                className="relative"
              >
                <Link to="/gunluk-kasa" className="nav-link">
                  <i className="fa-solid fa-wallet"></i>Kassa
                </Link>
              </li>
              <li
                ref={tanimRef}
                onClick={() => setTanimDropShow(!tanimDropShow)}
                className="relative"
              >
                <span className="nav-link flex items-center space-x-2 cursor-pointer">
                  <i className="fa-solid fa-bars"></i>
                  <span>Tanitmlar</span>
                  <i className="fa-solid fa-angle-down"></i>
                </span>
                {tanimDropShow && (
                  <ul className="dropdown absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                    <li className="hover:bg-gray-100">
                      <Link
                        to="/stok"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        Anbar Mal əlavə edilməsi
                      </Link>
                    </li>
                    <li className="hover:bg-gray-100">
                      <Link
                        to="/couriers"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        Kuryer Qeydiyati
                      </Link>
                    </li>
                    <li className="hover:bg-gray-100">
                      <Link
                        to="/masa-tanimlari"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        Masa Nizamlanmasi
                      </Link>
                    </li>
                    <li className="hover:bg-gray-100">
                      <Link
                        to="/personel-tanimlari"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        İşçi Qeydiyati
                      </Link>
                    </li>
                    <li className="hover:bg-gray-100">
                      <Link
                        to="/genel-ayarlar"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        Nizamlamalar
                      </Link>
                      <Link
                        to="/material"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        Xammal
                      </Link>
                      <Link
                        to="/expenses"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        xərclər
                      </Link>
                         <Link
                        to="/stocksadd"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        Stok əlavə et
                      </Link>
                    </li>

                  </ul>
                )}
              </li>
            </>
          )}
          <div>
            <NewOrders />
            <DateTimeDisplay />
          </div>
        </ul>

        <div
          className="flex gap-5 items-center"
          onClick={handleProfileOptionsToggle}
        >
          {/* {role !== 'waiter' && ( */}
          <img
            onClick={() => setProfDropShow(!profDropShow)}
            className="cursor-pointer bg-[#f2f3f4] w-8 h-8 rounded-full"
            src={replaceImage(formData.logo)}
            alt="Logo"
          />
          {/* )} */}
          <div
            ref={profRef}
            className="cursor-pointer relative hidden lg:flex flex-col items-center"
          >
            <div
              onClick={() => setProfDropShow(!profDropShow)}
              className="text-center"
            >
              <h3 className="text-base font-medium">{meData.name}</h3>
              <p className="text-xs text-gray-500">{formData.name}</p>
            </div>
            {profDropShow && (
              <ul className="dropdown right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg absolute">
                <li>
                  <a
                    href="#"
                    className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                    onClick={handleClick}
                  >
                    Çıxın
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}

      <div
        className={`lg:hidden fixed inset-0 z-40 bg-white shadow-lg ${
          mobileMenuOpen ? "block" : "hidden"
        } transition-transform transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } duration-300 ease-in-out`}
      >
        <div className="p-4 max-w-mobile h-full flex flex-col bg-white shadow-lg">
          <button
            onClick={handleMobileMenuToggle}
            className="text-right text-2xl mb-4"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div className="flex-grow overflow-y-auto overflow-x-hidden">
            <NewOrders />
            <DateTimeDisplay />

            <div className="text-center mt-4 mb-6">
              <h3 className="text-2xl font-bold mb-2">{meData.name}</h3>
              <p className="text-xl font-medium">{formData.name}</p>
            </div>

            {showProfileOptions ? (
              <div className="flex flex-col items-center">
                <button
                  onClick={handleClick}
                  className="py-2 px-4 text-blue-500 hover:bg-gray-100 w-full text-left mb-2"
                >
                  Çıxın
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/masalar"
                    className="nav-link flex items-center space-x-2"
                    onClick={handleMobileMenuToggle}
                  >
                    <i className="fa-solid fa-utensils"></i>
                    <span>Masalar</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/siparisler"
                    className="nav-link flex items-center space-x-2"
                    onClick={handleMobileMenuToggle}
                  >
                    <i className="fa-solid fa-burger"></i>
                    <span>Siparişler</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/musteriler"
                    className="nav-link flex items-center space-x-2"
                    onClick={handleMobileMenuToggle}
                  >
                    <i className="fa-regular fa-user"></i>
                    <span>Müştərilər</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/gunluk-kasa"
                    className="nav-link flex items-center space-x-2"
                    onClick={handleMobileMenuToggle}
                  >
                    <i className="fa-solid fa-wallet"></i>
                    <span>Kasa</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setMobileTanimDropShow(!mobileTanimDropShow)}
                    className="flex items-center space-x-2 w-full text-left"
                  >
                    <i className="fa-solid fa-bars"></i>
                    <span>Tanımlar</span>
                    <i
                      className={`fa-solid fa-angle-down transition-transform ${
                        mobileTanimDropShow ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>
                  {mobileTanimDropShow && (
                    <ul className="ml-4 mt-2 space-y-2">
                      <li>
                        <Link
                          to="/stok"
                          className="nav-link flex items-center space-x-2"
                          onClick={handleMobileMenuToggle}
                        >
                          <i className="fa-solid fa-box"></i>
                          <span>Anbar Mal əlavə edilməsi</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/couriers"
                          className="nav-link flex items-center space-x-2"
                          onClick={handleMobileMenuToggle}
                        >
                          <i className="fa-solid fa-truck"></i>
                          <span>Kuryer Qeydiyati</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/masa-tanimlari"
                          className="nav-link flex items-center space-x-2"
                          onClick={handleMobileMenuToggle}
                        >
                          <i className="fa-solid fa-table"></i>
                          <span>Masa Nizamlanmasi</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/personel-tanimlari"
                          className="nav-link flex items-center space-x-2"
                          onClick={handleMobileMenuToggle}
                        >
                          <i className="fa-solid fa-users"></i>
                          <span>İşçi Qeydiyati</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/genel-ayarlar"
                          className="nav-link flex items-center space-x-2"
                          onClick={handleMobileMenuToggle}
                        >
                          <i className="fa-solid fa-cogs"></i>
                          <span>Nizamlamalar</span>
                        </Link>

                        <Link
                        to="/material"
                        className="nav-link flex items-center space-x-2"
                        onClick={handleMobileMenuToggle}
                      >
                          <i className="fa fa-boxes"></i>
                          <span>Xammal</span>
                        
                      </Link>
                                 <Link
                        to="/expenses"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                            <i className="fa fa-boxes"></i>
                        xərclər
                          <span>Xammal</span>
                      </Link>
                         <Link
                        to="/stocksadd"
                        className="dropdown-link block px-4 py-2 text-gray-700 hover:text-blue-500"
                      >
                        Stok əlavə et
                      </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  token: state.Data.token,
});

const mapDispatchToProps = {
  logOut,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
