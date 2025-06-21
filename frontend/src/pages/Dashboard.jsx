import { useState, useEffect, useRef } from "react";
import { fetchCryptos, addCrypto } from "../services/api";
import CryptoCard from "../components/CryptoCard";
import { useNavigate } from "react-router-dom";
import coinList from "../data/coins.json";
import { RiLogoutBoxLine } from "react-icons/ri";

export default function Dashboard() {
  const navigate = useNavigate();
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const popupRef = useRef();
  const searchInputRef = useRef();

  // Auto logout if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Fetch user's crypto list
  useEffect(() => {
    const getCryptos = async () => {
      setLoading(true);
      try {
        const res = await fetchCryptos();
        setCryptos(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch crypto data");
      }
      setLoading(false);
    };
    getCryptos();
  }, []);

  useEffect(() => {
    if (searchInput.length > 0) {
      const filtered = coinList.filter((coin) =>
        coin.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
        coin.id.toLowerCase().includes(searchInput.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10));
    } else {
      setSuggestions([]);
    }
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add crypto handler
  const handleAddCrypto = async (symbol) => {
    const cryptoToAdd = symbol || searchInput.trim();
    if (!cryptoToAdd) {
      setError("Please enter a cryptocurrency symbol or select from the list");
      return;
    }
    setIsAdding(true);
    setError("");
    try {
      const result = await addCrypto(cryptoToAdd);
      if (result.success) {
        const res = await fetchCryptos();
        setCryptos(res.data);
        closePopup();
      } else {
        throw new Error(result.message || "Failed to add cryptocurrency");
      }
    } catch (err) {
      let errorMessage = err.response?.data?.message || err.message;
      if (err.response?.status === 404) {
        errorMessage = `"${cryptoToAdd}" not found. Try:\n`;
        if (err.response.data?.suggestions) {
          errorMessage += err.response.data.suggestions.join("\n");
        }
      } else if (err.response?.status === 500) {
        errorMessage = `Server error adding "${cryptoToAdd}". Try again later.`;
      }
      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCrypto();
    }
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setSearchInput("");
    setSuggestions([]);
    setError("");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Crypto Dashboard</h1>
            <p className="text-gray-400">Track your favorite ❤️ cryptocurrencies</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RiLogoutBoxLine className="inline-block text-xl"/> Logout
          </button>
        </header>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-white">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading your cryptocurrencies...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/80 text-red-100 p-4 mb-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold">Couldn't add cryptocurrency:</div>
                <div className="whitespace-pre-line mt-1">{error}</div>
              </div>
              <button 
                onClick={() => setError("")}
                className="text-white hover:text-gray-200 ml-2"
              >
                ×
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-red-800 text-sm">
              <div className="font-medium">Try these:</div>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Search and select from the dropdown</li>
                <li>Use official ID (like "ripple")</li>
                <li>Use symbol (like "xrp")</li>
                <li>Check for typos</li>
              </ul>
            </div>
          </div>
        )}

        {/* Crypto Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cryptos.map((crypto) => (
            <CryptoCard
            key={crypto.id}
            crypto={crypto}
            onDelete={(deletedId) => {
              setCryptos(prev => prev.filter(c => c.id !== deletedId));
            }}
          />
          ))}
          
          {/* Add New Crypto Card */}
          <div
            className="bg-gray-700/40 hover:bg-gray-600 cursor-pointer flex items-center justify-center rounded-xl h-48 transition-colors"
            onClick={() => {
              setShowPopup(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
          >
            <span className="text-white text-4xl">+</span>
          </div>
        </div>

        {/* Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div ref={popupRef} className="bg-gray-800 rounded-xl shadow-lg p-6 w-80 max-w-[95vw]">
              <h3 className="text-lg font-bold mb-4 text-white">Add Cryptocurrency</h3>
              <div className="text-sm text-gray-400 mb-2">
                Tip: Use name, symbol or official ID
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddCrypto();
              }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="e.g. bitcoin, btc, ripple..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {suggestions.length > 0 && (
                  <ul className="max-h-40 overflow-y-auto space-y-2 mb-4">
                    {suggestions.map((coin) => (
                      <li
                        key={coin.id}
                        onClick={() => {
                          setSearchInput(coin.id);
                          setSuggestions([]);
                        }}
                        className="cursor-pointer p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                        title={`ID: ${coin.id}`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{coin.name}</span>
                          <span className="text-gray-400 text-sm">{coin.symbol.toUpperCase()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex justify-center items-center"
                  disabled={!searchInput.trim() || isAdding}
                >
                  {isAdding ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    `Add ${searchInput.trim().toUpperCase() || 'Crypto'}`
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
