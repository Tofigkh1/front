import React from 'react';

function DeleteUserModal({ user, onDeleteUser, onClose }) {
    const handleDelete = () => {
        onDeleteUser(user.id);
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white p-4 rounded shadow-lg w-full max-w-md'>
                <h3 className='text-xl font-bold mb-4'>İstifadəçini silin</h3>
                <p className='mb-4'>{user.name} İstifadəçini silmək istədiyinizə əminsiniz ?</p>
                <div className='flex justify-end gap-2'>
                    <button onClick={onClose} className='bg-gray-500 text-white py-1 px-3 rounded'>Bağla</button>
                    <button onClick={handleDelete} className='bg-red-500 text-white py-1 px-3 rounded'>Sil</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteUserModal;
