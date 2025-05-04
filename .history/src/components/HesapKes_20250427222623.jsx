

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AccessDenied from './AccessDenied';
import { base_url } from '../api/index';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTableOrderStocks } from '../redux/stocksSlice';
const getHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
function HesapKes({ quickOrderId, totalAmount }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux'tan doğru orderı seç
  const currentOrder = useSelector((state) => 
    state.order.orders[quickOrderId] || { 
      shares: [], 
      items: [], 
      totalAmount: 0 
    }
  );
  
  const { shares = [], items = [], orderId } = currentOrder;

  // Order yükleme efekti
  useEffect(() => {
    if (quickOrderId && !currentOrder.orderId) {
      dispatch(fetchOrderById(quickOrderId));
    }
  }, [quickOrderId, dispatch]);

  // Ödeme hesaplamaları
  const [discount, setDiscount] = useState(0);
  const discountedTotal = totalAmount * (1 - discount / 100);

  // Ödeme tipleri state
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [isCariMusteriSelected, setIsCariMusteriSelected] = useState(false);
  const [isParcaParcaOde, setIsParcaParcaOde] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [sum, setSum] = useState(Array(numberOfPeople).fill(0));

  // Parçalı ödeme hesaplama
  useEffect(() => {
    if (isParcaParcaOde) {
      const baseAmount = discountedTotal / numberOfPeople;
      const roundedAmount = Math.floor(baseAmount * 100) / 100;
      const newSum = Array(numberOfPeople).fill(roundedAmount);
      const difference = discountedTotal - (roundedAmount * numberOfPeople);
      newSum[numberOfPeople - 1] += difference;
      setSum(newSum.map(num => parseFloat(num.toFixed(2))));
    }
  }, [discount, numberOfPeople, isParcaParcaOde]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quickOrderId) {
      alert("Order ID bulunamadı!");
      return;
    }

    const paymentData = {
      shares: shares.map(share => ({
        ...share,
        amount: share.amount * (1 - discount / 100)
      }))
    };

    try {
      await axios.post(
        `${base_url}/order/${quickOrderId}/payments`,
        paymentData,
        getHeaders()
      );
      navigate('/masalar');
    } catch (error) {
      console.error("Ödeme hatası:", error);
    }
  };
    
  if (accessDenied) return <AccessDenied onClose={setAccessDenied}/>;
  return (
    <form onSubmit={handleSubmit}>
      <div className='border rounded bg-gray-50 m-4 p-3'>
        <div className='flex items-center'>
          <div className='w-1/3 flex h-14 border rounded-l items-center px-2 bg-gray-100 gap-5'>
            Toplam Məbləğ
          </div>
          <input
            className='w-2/3 h-14 px-6 border border-l-0 rounded-r'
            type='text'
            value={orderId.total_price}
            readOnly
          />
        </div>
      </div>
      <div className='border rounded bg-green-50 m-4 p-3'>
        <div className='flex items-center'>
          <div className='w-1/3 flex h-14 border rounded-l items-center px-2 bg-gray-100 gap-5'>
          Artıq ödənilib
          </div>
          <input
            className='w-2/3 h-14 px-6 border border-l-0 rounded-r'
            type='text'
            value={orderId.total_prepayment}
            readOnly
          />
        </div>
      </div>
      <div className='border rounded bg-gray-50 m-4 p-3'>
        <div className='flex items-center'>
        <div className='w-1/3 flex h-14 border rounded-l items-center px-2 bg-gray-100 gap-5'>
            İndirim (%)
          </div>
          <input
            className='w-2/3 h-14 px-6 border border-l-0 rounded-r'
            type='number'
            min="0"
            max="100"
            step="1"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) )}
          />
          <div className='w-1/3 flex h-14 border text-red-400 rounded-l items-center px-2 bg-gray-100 gap-5'>
          Qalıq
          </div> 
          <input
            className='w-2/3 h-14 px-6 border border-l-0 rounded-r'
            type='text'
            value={totalAmount}
            readOnly
          />
        </div>
      </div>
      <div className='border rounded bg-blue-50 m-4 p-3'>
        <div className='flex items-center'>
          <div className='w-1/3 flex h-14 border rounded-l items-center px-2 bg-gray-100 gap-5'>
            İndirimli Toplam
          </div>
          <input
            className='w-2/3 h-14 px-6 border border-l-0 rounded-r'
            type='text'
            value={discountedTotal.toFixed(2)}
            readOnly
          />
        </div>
      </div>
      <div className='mx-4 flex flex-col gap-2'>
        {['pesin', 'bank-havale', 'musteriye-aktar', 'parca-ode'].map((type) => (
          <label
            key={type}
            className={`flex items-center p-2 border rounded bg-white shadow-sm ${selectedPaymentType === type ? 'bg-yellow-100 border-yellow-500' : ''}`}
          >
            <input
              type='radio'
              name='odemeType'
              id={type}
              checked={selectedPaymentType === type}
              onChange={() => handlePaymentTypeChange(type)}
              className='mr-2'
            />
            {type === 'pesin' && 'Nağd'}
            {type === 'bank-havale' && 'Bank Kartına '}
            {type === 'musteriye-aktar' && 'Müştəri hesabına '}
            {type === 'parca-ode' && 'Hissə hissə ödə'}
          </label>
        ))}
      </div>
      {isCariMusteriSelected && (
        <div id="aktar" className="p-4 bg-white shadow-md rounded-lg mt-4">
          <p className="text-lg font-semibold mb-2">Müştərilər</p>
          <select
            className="form-select block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            value={selectedCustomerId || ''}
          >
            <option value="">Seçiniz</option>
            {customerOptions.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
      )}

      {isParcaParcaOde && (
        <div id="parcaode" className="p-4 bg-white shadow-md rounded-lg mt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {[2, 3, 4, 5].map((num) => (
              <div
                key={num}
                onClick={() => handleNumberOfPeopleChange(num)}
                className={`flex-1 min-w-[100px] p-4 border border-gray-300 rounded-lg bg-gray-50 text-center cursor-pointer ${numberOfPeople === num ? 'bg-yellow-100' : ''}`}
              >
                {num} kişi
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 text-center font-semibold border-b border-gray-300 pb-2 mb-2">
              <div>No</div>
              <div>Məbləğ</div>
              <div>Ödeme</div>
            </div>
            <div>
              {sum.map((_, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center border-b border-gray-200 py-2">
                  <div className="flex items-center justify-center border border-gray-300 p-2 rounded">{index + 1}.</div>
                  <input
                    type="number"
                    step="0.1"
                    value={sum[index]}
                    onChange={(e) => handleSumChange(index, e.target.value)}
                    className="border border-gray-300 rounded p-2 w-full"
                  />
                  <select
                    className="border border-gray-300 rounded p-2 w-full"
                  >
                    <option>Peşin</option>
                    <option>Banka havalesi</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          {sumMessage && (
            <div className={`p-2 mt-4 text-white font-semibold ${totalSum > totalAmount ? 'bg-red-600' : 'bg-yellow-600'}`}>
              {sumMessage}
            </div>
          )}
        </div>
      )}

      <button className='block w-[calc(100%-32px)] bg-sky-600 font-medium mx-4 mb-1 py-2 px-4 rounded text-white'>
        Hesap kes
      </button>
    </form>
  );
}

export default HesapKes;
