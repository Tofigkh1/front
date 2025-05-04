import React from "react";

const TotalPriceHesab = ({ totalPrice, setHesabKes, setHandleModal, handlePrint, handleDeleteMasa }) => {
 
  return (
    <div className="flex gap-2 mt-4">
        
      {totalPrice && (
        <>
      
          <button
            onClick={() => setHesabKes(true)}
            className="bg-green-500 text-white py-2 px-4 rounded flex items-center gap-2"
          >
            Hesap kes
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white py-2 px-4 rounded flex items-center gap-2"
          >
            Qəbz çap edin
          </button>
        </>
      )}
      <button
        onClick={handleDeleteMasa}
        className="bg-gray-800 text-white py-2 px-4 rounded flex items-center gap-2"
      >
        Ləğv edin
      </button>
    </div>
  );
};

export default TotalPriceHesab;
