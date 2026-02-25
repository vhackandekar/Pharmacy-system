import React, { createContext, useContext, useState, useEffect } from 'react';

const DeliveryProfileContext = createContext();

export const useDeliveryProfile = () => useContext(DeliveryProfileContext);

const defaultProfile = {
  name: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  pin: '',
  payment: 'cod',
};

export const DeliveryProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('dispatch-profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const saveProfile = (data) => {
    setProfile(data);
    localStorage.setItem('dispatch-profile', JSON.stringify(data));
  };

  return (
    <DeliveryProfileContext.Provider value={{ profile, saveProfile }}>
      {children}
    </DeliveryProfileContext.Provider>
  );
};
