

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MusteriInfo from '../components/MusteriInfo';
import MusteriEkle from '../components/MusteriEkle';
import AccessDenied from '../components/AccessDenied'; // Импортируем компонент AccessDenied
import { base_url } from '../api/index';
import { Helmet } from 'react-helmet';
import DontActiveAcount from '../components/DontActiveAcount';
const getHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import AccessDenied from '@/components/modals/AccessDenied';
import base_url from '@/utils/baseUrl';

const getHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

function Expenses() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Kateqoriyaları yüklə
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/expense-categories`, getHeaders());
      setCategories(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  // ✅ Xərcləri yüklə
  const fetchExpenses = async (categoryId) => {
    try {
      const response = await axios.get(`${base_url}/api/expense-categories/${categoryId}/expenses`, getHeaders());
      setExpenses(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  // ✅ Xərc əlavə et
  const handleAddExpense = async () => {
    if (!amount || !reason || !selectedCategory) return;
    try {
      await axios.post(`${base_url}/api/expense-categories/${selectedCategory}/expenses`, {
        amount: parseFloat(amount),
        reason
      }, getHeaders());

      setAmount('');
      setReason('');
      fetchExpenses(selectedCategory);
      fetchCategories(); // total_expense yeniləmək üçün
    } catch (error) {
      handleError(error);
    }
  };

  // ✅ Kateqoriyanı sil
  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${base_url}/api/expense-categories/${categoryId}`, getHeaders());
      setCategories(categories.filter(cat => cat.id !== categoryId));
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setExpenses([]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 403) {
      setAccessDenied(true);
    } else {
      console.error('Xəta baş verdi:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchExpenses(selectedCategory);
    }
  }, [selectedCategory]);

  if (accessDenied) return <AccessDenied onClose={() => setAccessDenied(false)} />;

  return (
    <>
      <Helmet>
        <title>Xərclər | Smartcafe</title>
      </Helmet>

      <section className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ✅ Kateqoriya siyahısı */}
          <div className="border rounded p-4 shadow">
            <h2 className="font-semibold mb-2">Xərc Kateqoriyaları</h2>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.id} className={`p-2 rounded cursor-pointer ${selectedCategory === cat.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`} onClick={() => setSelectedCategory(cat.id)}>
                  <div className="flex justify-between items-center">
                    <span>{cat.name} ({cat.total_expense} ₼)</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="text-red-500 hover:text-red-700 text-sm">Sil</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Seçilmiş kateqoriya xərcləri */}
          <div className="md:col-span-2 border rounded p-4 shadow">
            {selectedCategory ? (
              <>
                <h2 className="font-semibold mb-4">Xərclər</h2>
                <div className="space-y-2">
                  {expenses.map((exp, index) => (
                    <div key={index} className="border p-2 rounded bg-gray-50">
                      <div>Məbləğ: <strong>{exp.amount} ₼</strong></div>
                      <div>Səbəb: {exp.reason}</div>
                      <div>Tarix: {exp.created_at}</div>
                    </div>
                  ))}
                </div>

                {/* ✅ Yeni xərc formu */}
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-semibold mb-2">Yeni Xərc Əlavə Et</h3>
                  <input type="number" placeholder="Məbləğ" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded p-2 mb-2" />
                  <input type="text" placeholder="Səbəb" value={reason} onChange={e => setReason(e.target.value)} className="w-full border rounded p-2 mb-2" />
                  <button onClick={handleAddExpense} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Əlavə Et</button>
                </div>
              </>
            ) : (
              <div className="text-center text-blue-500">Zəhmət olmasa xərc kateqoriyası seçin.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Expenses;
