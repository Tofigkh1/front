

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { base_url } from '../api/index';
import { Helmet } from 'react-helmet';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirectToMasalar, setRedirectToMasalar] = useState(false);

  // Check if a token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setRedirectToMasalar(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual API endpoint
      const response = await axios.post(`${base_url}/login`, { email, password });
      // Store token in localStorage
      // console.log(response.data);
      localStorage.setItem('token', response.data.access_token);
      localStorage.removeItem("booked_table_color")
      localStorage.removeItem("empty_table_color")
      localStorage.removeItem("selectedCustomerId")
      localStorage.removeItem("urunType")
      localStorage.removeItem("masaType")
      setRedirectToMasalar(true);
      window.location.reload()
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // setAccessDenied(true); // Set access denied if response status is 403
        alert("Belə bir istifadəçi tapılmadı.")
    }else{
      console.error('Login failed:', error);
      

    }
    }
  };

  if (redirectToMasalar) {
    return <Navigate to="/masalar" />;
  }

  return (
    <>
               <Helmet>
        <title> Login | Smartcafe</title>
        <meta name="description" content='Restoran proqramı | Kafe - Restoran idarə etmə sistemi ' />
      </Helmet>
    <main>
      <section>
        <div className="flex min-h-full h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-5xl font-bold leading-9 tracking-tight text-gray-900">
              Smartcafe
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email adresi
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={handleChange}
                    value={email}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Şifrə
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={handleChange}
                    value={password}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Daxil Ol
                </button>
              </div>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
            Restoran proqramı | Kafe - Restoran idarə etmə sistemi 
            </p>
            <p className='mt-5 text-center text-sm text-gray-500'>
        İş birliyi və demo üçün  <a title='+994 50 424 38 92' target='_blank' href="https://wa.me/+994504243892" className='text-blue-500 underline hover:text-blue-700'>
            WhatsApp ilə əlaqə saxlayın 
        </a>
       
    </p>
          </div>
        </div>
      </section>
    </main>
    </>
  );
};

export default Login;
