

import React, { useState } from 'react';

function EditUserModal({ user, onEditUser, onClose }) {
    const [name, setName] = useState(user.name);
    const [admin_name, setadmin_name] = useState(user.users[0].name);
    const [admin_email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState(user.is_active); // Correct field name
    const [expirationDate, setExpirationDate] = useState(user.active_until.slice(0,10)); // Default to empty string if null
// console.log(user);
const date = expirationDate
console.log(expirationDate,'s');

    const handleSubmit = () => {
        const updatedUser = {
            id: user.id,
            name,
            admin_name,
            admin_email,
            admin_password: password || user.password,
            is_active: status, // Correct field name
            active_until: expirationDate || null // Set to null if not provided
        };
        onEditUser(updatedUser);
        onClose();
    };
// console.log(user,'anar');
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white p-4 rounded shadow-lg w-full max-w-md'>
                <h3 className='text-xl font-bold mb-4'>İstifadəçini redaktə et</h3>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Restaran Adi</label>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Adminin adi</label>
                    <input
                        type='text'
                        value={admin_name}
                        onChange={(e) => setadmin_name(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Email</label>
                    <input
                        type='email'
                        value={admin_email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Parolun dəyişdirilməsi (isteğe bağlı)</label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='mb-4'>
                    <label className='flex items-center'>
                        <input
                            type='checkbox'
                            checked={status}
                            onChange={(e) => setStatus(e.target.checked)}
                            className='form-checkbox'
                        />
                        <span className='ml-2 text-sm font-medium'>Active</span>
                    </label>
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>İstifadə müddəti</label>
                    <input
                        type='date'
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='flex justify-end gap-2'>
                    <button onClick={onClose} className='bg-gray-500 text-white py-1 px-3 rounded'>Bağla</button>
                    <button onClick={handleSubmit} className='bg-blue-500 text-white py-1 px-3 rounded'>Güncələ</button>
                </div>
            </div>
        </div>
    );
}

export default EditUserModal;
