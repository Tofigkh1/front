// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AddUserModal from '../components/AddUserModal';
// import EditUserModal from '../components/EditUserModal';
// import DeleteUserModal from '../components/DeleteUserModal';
// import axios from 'axios';
// import { base_url } from '../api/index';
// function Dashboard() {
//     const [restaurants, setRestaurants] = useState([]);
//     const [showAddUserModal, setShowAddUserModal] = useState(false);
//     const [showEditUserModal, setShowEditUserModal] = useState(false);
//     const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
//     const [selectedRestaurant, setSelectedRestaurant] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const token = localStorage.getItem('admin_token');
//         if (!token) {
//             navigate('/404');
//         } else {
//             fetchRestaurants();
//         }
//     }, [navigate]);

//     const fetchRestaurants = async () => {
//         try {
//             const response = await axios.get(`${base_url}/admin-restaurants`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('admin_token')}`
//                 }
//             });
//             setRestaurants(response.data);
//             // console.log(response.data,'adminsuper');
//             // const AdminName = response.data.map(item=>{
//             //     return item.user[0].name
//             // })
//             // console.log(response.data[4].users[0].name);
//         } catch (error) {
//             console.error('Failed to fetch restaurants', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAddRestaurant = async (newRestaurant) => {
//         // const staticData = {
//         //     language: 'Aze',
//         //     is_qr_active: false,
//         //     get_qr_order: false,
//         //     currency: 'misal'
//         // };

//         try {
//             await axios.post(`${base_url}/admin-restaurants`, {
//                 ...newRestaurant,
//                 // ...staticData
//             }, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('admin_token')}`
//                 }
//             });
//             console.log(newRestaurant,'data');
//             fetchRestaurants(); // Refresh the list
//             setShowAddUserModal(false);
//         } catch (error) {
//             console.error('Failed to add restaurant', error);
//         }
//     };

//     const handleEditRestaurant = async (updatedRestaurant) => {
//         try {
//             await axios.put(`${base_url}/admin-restaurants/${updatedRestaurant.id}`, {
//                 ...updatedRestaurant,

//             }, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('admin_token')}`
//                 }
//             });
//             fetchRestaurants(); // Refresh the list
//             setShowEditUserModal(false);
//         } catch (error) {
//             console.error('Failed to update restaurant', error);
//         }
//     };

//     const handleDeleteRestaurant = async (id) => {
//         try {
//             await axios.delete(`${base_url}/admin-restaurants/${id}`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('admin_token')}`
//                 }
//             });
//             setRestaurants(restaurants.filter(restaurant => restaurant.id !== id));
//             setShowDeleteUserModal(false);
//         } catch (error) {
//             console.error('Failed to delete restaurant', error);
//         }
//     };

//     const handleStatusChange = (id, status) => {
//         setRestaurants(restaurants.map(restaurant => restaurant.id === id ? { ...restaurant, status } : restaurant));
//     };

//     return (
//         <div className='p-4'>
//             <div className='flex justify-between mb-4'>
//                 <h1 className='text-2xl font-bold'>İdarə paneli</h1>
//                 <button
//                     onClick={() => setShowAddUserModal(true)}
//                     className='bg-green-500 text-white py-2 px-4 rounded'
//                 >
//                    İstifadəçi yaradın
//                 </button>
//             </div>

//             {loading ? (
//                 <p>Loading...</p>
//             ) : (
//                 <table className='min-w-full bg-white border border-gray-200'>
//                     <thead>
//                         <tr>
//                             <th className='p-2 border-b'>Restoranin Adi</th>
//                             <th className='p-2 border-b'>Istvadecinin Adi</th>
//                             <th className='p-2 border-b'>Email</th>
//                             <th className='p-2 border-b'>Status</th>
//                             <th className='p-2 border-b'>İstifadə müddəti</th>
//                             <th className='p-2 border-b'>Fəaliyyətlər</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {restaurants.map(restaurant => (
//                             <tr key={restaurant.id}>
//                                 {/* console.log(restaurant,'data'); */}
//                                 <td className='p-2 border-b'>{restaurant.name}</td>
//                                 {restaurant.users[0] && (<td className='p-2 border-b'>{restaurant.users[0].name}</td>)}
//                                 <td className='p-2 border-b'>{restaurant.email}</td>
//                                 <td className='p-2 border-b'>
//                                     <input
//                                         type='checkbox'
//                                         checked={restaurant.is_active}
//                                         onChange={(e) => handleStatusChange(restaurant.id, e.target.checked)}
//                                         className='form-checkbox'
//                                     />
//                                 </td>
//                                 <td className='p-2 border-b'>{restaurant.active_until}</td>
//                                 <td className='p-2 border-b'>
//                                     <button
//                                         onClick={() => { setSelectedRestaurant(restaurant); setShowEditUserModal(true); }}
//                                         className='bg-yellow-500 text-white py-1 px-3 rounded mr-2'
//                                     >
//                                          Düzənlə
//                                     </button>
//                                     <button
//                                         onClick={() => { setSelectedRestaurant(restaurant); setShowDeleteUserModal(true); }}
//                                         className='bg-red-500 text-white py-1 px-3 rounded'
//                                     >
//                                         Sil
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}

//             {showAddUserModal && <AddUserModal onAddUser={handleAddRestaurant} onClose={() => setShowAddUserModal(false)} />}
//             {showEditUserModal && <EditUserModal user={selectedRestaurant} onEditUser={handleEditRestaurant} onClose={() => setShowEditUserModal(false)} />}
//             {showDeleteUserModal && <DeleteUserModal user={selectedRestaurant} onDeleteUser={() => handleDeleteRestaurant(selectedRestaurant.id)} onClose={() => setShowDeleteUserModal(false)} />}
//         </div>
//     );
// }

// export default Dashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddUserModal from "../components/AddUserModal";
import EditUserModal from "../components/EditUserModal";
import DeleteUserModal from "../components/DeleteUserModal";
import axios from "axios";
import { base_url } from "../api/index";
import { Helmet } from "react-helmet";

function Dashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/404");
    } else {
      fetchRestaurants();
    }
  }, [navigate]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${base_url}/admin-restaurants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      setRestaurants(response.data);
    } catch (error) {
      console.error("Failed to fetch restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = async (newRestaurant) => {
    try {
      await axios.post(`${base_url}/admin-restaurants`, newRestaurant, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      fetchRestaurants(); // Refresh the list
      setShowAddUserModal(false);
    } catch (error) {
      if (error.response) {
        // Check if the error response contains the specific message
        const errorMessage =
          error.response.data.error || error.response.data.message;
        if (errorMessage && errorMessage.includes("Email already exists")) {
          alert("Bu emailda istifadeci movcudtur");
        } else {
          console.error("Failed to add restaurant:", errorMessage);
          // alert('Failed to add restaurant. Please try again.');
        }
      } else {
        console.error("Failed to add restaurant:", error);
        // alert('Failed to add restaurant. Please try again.');
      }
    }
  };

  const handleEditRestaurant = async (updatedRestaurant) => {
    try {
      await axios.put(
        `${base_url}/admin-restaurants/${updatedRestaurant.id}`,
        updatedRestaurant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );
      fetchRestaurants(); // Refresh the list
      setShowEditUserModal(false);
    } catch (error) {
      console.error("Failed to update restaurant", error);
    }
  };

  const handleDeleteRestaurant = async (id) => {
    try {
      await axios.delete(`${base_url}/admin-restaurants/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
      setShowDeleteUserModal(false);
    } catch (error) {
      console.error("Failed to delete restaurant", error);
    }
  };

  const handleStatusChange = (id, status) => {
    setRestaurants(
      restaurants.map((restaurant) =>
        restaurant.id === id ? { ...restaurant, status } : restaurant
      )
    );
  };

  return (
    <>
      <Helmet>
        <title>Idarə Paneli | Smartcafe</title>
        <meta
          name="description"
          content="Restoran proqramı | Kafe - Restoran idarə etmə sistemi "
        />
      </Helmet>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0">İdarə paneli</h1>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            İstifadəçi yaradın
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="p-2 border-b">Restoranin Adi</th>
                  <th className="p-2 border-b">Istifadəçinin Adı</th>
                  <th className="p-2 border-b">Email</th>
                  <th className="p-2 border-b">Status</th>
                  <th className="p-2 border-b">İstifadə müddəti</th>
                  <th className="p-2 border-b">Fəaliyyətlər</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td className="p-2 border-b">{restaurant.name}</td>
                    {restaurant.users[0] && (
                      <td className="p-2 border-b">
                        {restaurant.users[0].name}
                      </td>
                    )}
                    <td className="p-2 border-b">{restaurant.email}</td>
                    <td className="p-2 border-b">
                      <input
                        type="checkbox"
                        checked={restaurant.is_active}
                        onChange={(e) =>
                          handleStatusChange(restaurant.id, e.target.checked)
                        }
                        className="form-checkbox"
                      />
                    </td>
                    <td className="p-2 border-b">
                      {restaurant.active_until.slice(0, 10)}
                    </td>
                    <td className="p-2 border-b flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setShowEditUserModal(true);
                        }}
                        className="bg-yellow-500 text-white py-1 px-3 rounded"
                      >
                        Düzənlə
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setShowDeleteUserModal(true);
                        }}
                        className="bg-red-500 text-white py-1 px-3 rounded"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showAddUserModal && (
          <AddUserModal
            onAddUser={handleAddRestaurant}
            onClose={() => setShowAddUserModal(false)}
          />
        )}
        {showEditUserModal && (
          <EditUserModal
            user={selectedRestaurant}
            onEditUser={handleEditRestaurant}
            onClose={() => setShowEditUserModal(false)}
          />
        )}
        {showDeleteUserModal && (
          <DeleteUserModal
            user={selectedRestaurant}
            onDeleteUser={() => handleDeleteRestaurant(selectedRestaurant.id)}
            onClose={() => setShowDeleteUserModal(false)}
          />
        )}
      </div>
    </>
  );
}

export default Dashboard;
