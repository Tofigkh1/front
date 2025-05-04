

import React, { useState } from 'react';

function AddUserModal({ onAddUser, onClose }) {
    const [name, setName] = useState('');
    const [admin_email, setadmin_emai] = useState('');
    const [admin_name, setadmin_name] = useState('');
    const [admin_password, setadmin_password] = useState('');
    const [is_active, setIsActive] = useState(false);
    const [active_until, setActiveUntil] = useState(''); // Default empty string
console.log(active_until,'data');
    const handleSubmit = () => {
        if (name && admin_email) {
            const newUser = {
                name,
                admin_email,
                admin_name,
                admin_password,
                is_active,
                active_until: active_until // Default to null if empty
            };
            
            onAddUser(newUser);
            setName('');
            setadmin_emai('');
            setadmin_name('')
            setadmin_password('');
            setIsActive(false);
            setActiveUntil('');
        }
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white p-4 rounded shadow-lg w-full max-w-md'>
                <h3 className='text-xl font-bold mb-4'>İstifadəçi yaradın</h3>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Restoran Adi</label>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Adminin Adi</label>
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
                        onChange={(e) => setadmin_emai(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Parol</label>
                    <input
                        type='password'
                        value={admin_password}
                        onChange={(e) => setadmin_password(e.target.value)}
                        className='border rounded w-full p-2'
                    />
                </div>
                <div className='mb-4'>
                    <label className='flex items-center'>
                        <input
                            type='checkbox'
                            checked={is_active}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className='form-checkbox'
                        />
                        <span className='ml-2 text-sm font-medium'>Active</span>
                    </label>
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>İstifadə müddəti</label>
                    <input
                        type='date'
                        value={active_until}
                        onChange={(e) => setActiveUntil(e.target.value)}
                        className='border rounded w-full p-2'
                        required
                    />
                </div>
                <div className='flex justify-end gap-2'>
                    <button onClick={onClose} className='bg-gray-500 text-white py-1 px-3 rounded'>Kapat</button>
                    <button onClick={handleSubmit} className='bg-blue-500 text-white py-1 px-3 rounded'>Yarat</button>
                </div>
            </div>
        </div>
    );
}

export default AddUserModal;
