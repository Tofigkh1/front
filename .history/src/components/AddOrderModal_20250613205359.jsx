
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccessDenied from './AccessDenied';
import { base_url } from '../api/index';
const AddOrderModal = ({ onClose, }) => {
    const [name, setName] = useState('-');
    const [phone, setPhone] = useState('-');
    const [address, setAddress] = useState('-');
    const [accessDenied, setAccessDenied] = useState(false);
    const navigate = useNavigate(); // Initialize the useNavigate hook
    // const [alertSuccess, setAlertSuccess] = useState(false);

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${base_url}/quick-orders`, {
                name,
                phone,
                address
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            // setAlertSuccess(true);
            // Extract the order ID from the response, assuming it is returned
            const orderId = response.data.id; // Adjust according to your API response

            // Redirect to the `muster-siparis-ekle/id` page
          
            navigate(`/muster-siparis-ekle/${orderId}`);
            
            // onSuccess(); // Optionally call onSuccess handler

        } catch (error) {
            
            if (error.response && error.response.status === 403) {
                setAccessDenied(true); // Set access denied if response status is 403
            }else{

                console.error('Error adding order:', error);
            }
        }
    };
    if (accessDenied) return <AccessDenied onClose={setAccessDenied}/>;
    return (
        <>
         
        {/* {alertSuccess && <AlertSuccess setAlertSuccess={setAlertSuccess}/>} */}
        </>
    
    );
};

export default AddOrderModal;
