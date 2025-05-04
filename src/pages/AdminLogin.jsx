import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { base_url } from '../api/index';
import { Helmet } from "react-helmet";
function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            // Send a POST request to the login endpoint
            const response = await axios.post(`${base_url}/login`, {
                email,
                password
            });
            console.log(response, 'response');

            // Check if the response has the access_token
            if (response.data && response.data.access_token) {
                // Save the access_token in local storage
                localStorage.setItem('admin_token', response.data.access_token);

                // Navigate to the dashboard
                navigate('/adminPage/dashboard');
            } else {
                // If the access_token is not present, show an error message
                setError('Invalid email or password');
            }
        } catch (err) {
            // Handle errors from the API
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
    };

    return (
        <>
                    <Helmet>
        <title>Super Admin Giriş | Smartcafe </title>
        <meta name="description" content='Restoran proqramı | Kafe - Restoran idarə etmə sistemi ' />
      </Helmet>
           <div className='flex items-center justify-center h-screen bg-gray-100'>
            <div className='bg-white p-6 rounded shadow-lg w-full max-w-sm'>
                <h2 className='text-2xl font-bold mb-4'>Admin Login</h2>
                {error && <p className='text-red-500 mb-4'>{error}</p>}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Email</label>
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Password</label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className='bg-blue-500 text-white py-2 px-4 rounded'
                >
                    Login
                </button>
            </div>
        </div>
        </>
     
    );
}

export default AdminLogin;
