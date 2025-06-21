import axios from "axios";

const API_BASE = "https://crypto-pulse-8dtn.onrender.com/api";

export const signupUser= (data)=>axios.post(`${API_BASE}/signup`, data);
export const loginUser= (data)=>axios.post(`${API_BASE}/login`, data);
export const forgotPassword= (data)=>axios.post(`${API_BASE}/forgot-password`, data);
export const verifyOTP = (data) => axios.post(`${API_BASE}/verify-otp`, data);
export const fetchCryptos = () => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_BASE}/cryptos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
};

export const searchCrypto = (query) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE}/cryptos/search?query=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteCrypto = async (symbol) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(
      `${API_BASE}/crypto/delete/${encodeURIComponent(symbol)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error('API Delete Error:', error);
    throw error;
  }
};

export const addCrypto = async (symbol) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(`${API_BASE}/crypto/add`,{symbol},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500
      }
    );
    if (response.status >= 400) {
      const error = new Error(response.data.message || 'Failed to add cryptocurrency');
      error.response = response;
      throw error;
    }
    return response.data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};