import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const demoUsers = {
  buyer: {
    _id: 'buyer-demo',
    name: 'Demo Buyer',
    email: 'buyer@heritcraft.com',
    role: 'buyer',
  },
  seller: {
    _id: 'seller-demo',
    name: 'Demo Seller',
    email: 'seller@heritcraft.com',
    role: 'seller',
    shopName: 'Golden Artisan Studio',
    shopDescription: 'Premium handmade heritage products',
  },
  admin: {
    _id: 'admin-demo',
    name: 'Demo Admin',
    email: 'admin@heritcraft.com',
    role: 'admin',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('heritcraft_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('heritcraft_user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    const selectedUser = demoUsers[role];

    if (!selectedUser) {
      throw new Error('Invalid role');
    }

    const fakeToken = `${role}-demo-token`;

    localStorage.setItem('heritcraft_token', fakeToken);
    localStorage.setItem('heritcraft_user', JSON.stringify(selectedUser));

    setToken(fakeToken);
    setUser(selectedUser);

    return {
      token: fakeToken,
      user: selectedUser,
    };
  };

  const register = async (data) => {
    const newUser = {
      _id: `${data.role}-registered-demo`,
      name: data.name || 'New User',
      email: data.email,
      role: data.role,
      shopName: data.shopName || '',
      shopDescription: data.shopDescription || '',
    };

    const fakeToken = `${data.role}-registered-token`;

    localStorage.setItem('heritcraft_token', fakeToken);
    localStorage.setItem('heritcraft_user', JSON.stringify(newUser));

    setToken(fakeToken);
    setUser(newUser);

    return {
      token: fakeToken,
      user: newUser,
    };
  };

  const logout = () => {
    localStorage.removeItem('heritcraft_token');
    localStorage.removeItem('heritcraft_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
