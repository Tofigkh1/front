import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Header from './components/Header'
import Couriers from './pages/Couriers'
import GunlukKasa from './pages/GunlukKasa'
import Masalar from './pages/Masalar'
import Stok from './pages/Stok'
import MasaTanimlari from './pages/MasaTanimlari'
import PersonelTanimlari from './pages/PersonelTanimlari'
import Siparisler from './pages/Siparisler'
import Musteriler from './pages/Musteriler'
import MasaSiparis from './pages/MasaSiparis'
import MusteriSiparisEkle from './pages/MusteriSiparisEkle'
import GenelAyarlar from './pages/GenelAyarlar'
import OrderDetailsQrcod from './pages/OrderDetailsQrcod'
import MasaTanimlariId from './pages/MasaTanimlariId'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import NotFoundPage from './pages/NotFoundPage'
import axios from 'axios'
import DontActiveAcount from './components/DontActiveAcount'
import { base_url } from '../src/api/index'
import Material from './pages/Material.jsx'
import Expenses from './pages/expenses.jsx'
import StocksAdd from './components/stocksSetAdd.jsx';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
const App = () => {
  const location = useLocation()
  const [ActiveUser, setActiveUser] = useState(false)
  // Determine if the header should be shown
  const showHeader = !(
    location.pathname.startsWith('/adminPage') ||
    location.pathname.startsWith('/order-details')
  )
  const [role, setrole] = useState(localStorage.getItem('role'))
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${base_url}/own-restaurants`,
          getHeaders(),
        )
      } catch (error) {
        console.log(error.response.data.message)
        // if (error.response && error.response.status === 401 && error.response.data.message === "Unauthenticated" ) {
        //     setActiveUser(true); // Set access denied if response status is 403
        // }
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data.message ===
            'User does not belong to any  active restaurant.'
        ) {
          setActiveUser(true) // Set access denied if response status is 403
        } else {
          console.error('Error fetching orders:', error)
        }
      }
    }
    fetchOrders()
  }, [])
  //   useEffect(() => {
  //     const fetchOrders = async () => {
  //         try {
  //             const response = await axios.get(`${base_url}/me`, getHeaders());
  //             // setOrders(response.data);
  //             // console.log(response.data,'orderDat1');
  //         } catch (error) {

  //             console.log(error.response.data.message);
  //             if (error.response && error.response.status === 401 && error.response.data.message === "Unauthenticated." ) {
  //                 setActiveUser(true); // Set access denied if response status is 403
  //             }
  //             // if (error.response &&( error.response.status === 403 && error.response.data.message === "User does not belong to any  active restaurant.")) {
  //             //     setActiveUser(true); // Set access denied if response status is 403
  //             // }
  //             else{

  //                 console.error('Error fetching orders:', error);
  //             }
  //         }
  //     };
  //    fetchOrders();
  // }, []);
  // const showHeader = !location.pathname.startsWith('/order-details');
  if (ActiveUser) return <DontActiveAcount sil={setActiveUser} />
  return (
    <div>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/masalar" element={<Masalar />} />
        <Route path="/masa-siparis/:id" element={<MasaSiparis />} />
        {role !== 'waiter' && (
          <>
            <Route path="/siparisler" element={<Siparisler />} />
            <Route path="/musteriler" element={<Musteriler />} />
            <Route path="/gunluk-kasa" element={<GunlukKasa />} />
            <Route path="/stok" element={<Stok />} />
            <Route path="/couriers" element={<Couriers />} />
            <Route path="/masa-tanimlari" element={<MasaTanimlari />} />
            <Route path="/masa-tanimlari/id" element={<MasaTanimlariId />} />
            <Route path="/personel-tanimlari" element={<PersonelTanimlari />} />
            <Route
              path="/muster-siparis-ekle/:id"
              element={<MusteriSiparisEkle />}
            />
            <Route path="/genel-ayarlar" element={<GenelAyarlar />} />
            <Route path="/material" element={<Material />} />
              <Route path="/expenses" element={<Expenses />} />
               <Route path="/stocksadd" element={<StocksAdd />} />
            <Route
              path="/order-details/:token"
              element={<OrderDetailsQrcod />}
            />
          </>
        )}

        <Route path="/adminPage" element={<AdminLogin />} />
        <Route path="/adminPage/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

const AppWithRouter = () => (
    <BrowserRouter>
    <App />
  </BrowserRouter>
)

export default AppWithRouter
