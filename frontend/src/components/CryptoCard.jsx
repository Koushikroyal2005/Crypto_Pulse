import { useState } from "react";
import { deleteCrypto } from "../services/api";

export default function CryptoCard({ crypto, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const getChangeColor = (value) => {
    if (!value) return "text-gray-400";
    return value >= 0 ? "text-green-400" : "text-red-400";
  };

  const getChangeIcon = (value) => {
    if (!value) return null;
    return value >= 0 ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await deleteCrypto(crypto.id);
      if (response.status === 200) {
        onDelete(crypto.id);
        setShowConfirm(false);
      } else {
        throw new Error(response.data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50">
        {/* Delete button */}
        <button
          className="
            absolute top-3 right-3
            p-1 rounded-md
            text-gray-400 hover:text-red-500
            hover:bg-gray-700/50
            transition-colors duration-150
            focus:outline-none focus:ring-1 focus:ring-red-500/50
            disabled:opacity-40
          "
          onClick={() => setShowConfirm(true)}
          title="Delete"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4" /* ... */ />
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <img
            src={crypto.image}
            alt={crypto.name}
            className="w-10 h-10 rounded-full bg-gray-700 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/40";
            }}
          />
          <div>
            <h2 className="font-semibold text-white">{crypto.name}</h2>
            <p className="text-xs text-gray-400 uppercase">{crypto.symbol}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400">Current Price</p>
            <p className="text-xl font-bold text-white">
              ${crypto.current_price?.toFixed(2) || "N/A"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                1h {getChangeIcon(crypto.price_change_percentage_1h_in_currency)}
              </p>
              <p className={`text-sm font-medium ${getChangeColor(crypto.price_change_percentage_1h_in_currency)}`}>
                {crypto.price_change_percentage_1h_in_currency?.toFixed(2) || "0.00"}%
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                24h {getChangeIcon(crypto.price_change_percentage_24h)}
              </p>
              <p className={`text-sm font-medium ${getChangeColor(crypto.price_change_percentage_24h)}`}>
                {crypto.price_change_percentage_24h?.toFixed(2) || "0.00"}%
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                7d {getChangeIcon(crypto.price_change_percentage_7d_in_currency)}
              </p>
              <p className={`text-sm font-medium ${getChangeColor(crypto.price_change_percentage_7d_in_currency)}`}>
                {crypto.price_change_percentage_7d_in_currency?.toFixed(2) || "0.00"}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-xs w-full text-white">
            <h3 className="text-lg font-bold mb-2">Delete {crypto.name}?</h3>
            <p className="text-gray-300 text-sm mb-4">
              Are you sure you want to remove this cryptocurrency from your dashboard?
            </p>
            {error && (
              <div className="text-red-400 text-sm mb-4 p-2 bg-red-900/20 rounded">
                Error: {error}
                {error.includes("not found") && (
                  <div className="mt-2 text-xs">
                    Your coins: {JSON.stringify(crypto.symbol)}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}