'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';

import { useRouter } from 'next/navigation';

const AuthContext = createContext();

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('haqms_token');
    localStorage.removeItem('haqms_user');

    setToken(null);
    setUser(null);

    router.push('/login');
  }, [router]);

  // Load persisted auth
  useEffect(() => {
    const storedToken = localStorage.getItem('haqms_token');
    const storedUser = localStorage.getItem('haqms_user');

if (storedToken && storedUser) {
  try {
    const parsedUser = JSON.parse(storedUser);

    setToken(() => storedToken);
    setUser(() => parsedUser);
  } catch (err) {
    console.error(
      '[AUTH] Failed to parse localStorage user:',
      err
    );

    logout();
  }
}

    setLoading(false);
  }, [logout]);

  // Login
  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        let data = null;

        try {
          data = await response.json();
        } catch (jsonError) {
          throw new Error('Invalid server response');
        }

        if (!response.ok) {
          throw new Error(
            data?.error || 'Authentication failed'
          );
        }

        if (!data || !data.token || !data.user) {
          throw new Error(
            'Invalid response from server'
          );
        }

        // Persist auth
        localStorage.setItem(
          'haqms_token',
          data.token
        );

        localStorage.setItem(
          'haqms_user',
          JSON.stringify(data.user)
        );

        // Update state
        setToken(data.token);
        setUser(data.user);

        // Navigate
        router.push('/dashboard');

        return {
          success: true,
        };
      } catch (err) {
        console.error(
          '[AUTH-ERROR] Login request failed:',
          err
        );

        setError(err.message);

        return {
          success: false,
          error: err.message,
        };
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Register
  const register = useCallback(
    async (
      name,
      email,
      password,
      role = 'RECEPTIONIST'
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name,
              email,
              password,
              role,
            }),
          }
        );

        let data = null;

        try {
          data = await response.json();
        } catch (jsonError) {
          throw new Error('Invalid server response');
        }

        if (!response.ok) {
          throw new Error(
            data?.error || 'Registration failed'
          );
        }

        return await login(email, password);
      } catch (err) {
        console.error(
          '[AUTH-ERROR] Register request failed:',
          err
        );

        setError(err.message);

        return {
          success: false,
          error: err.message,
        };
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
