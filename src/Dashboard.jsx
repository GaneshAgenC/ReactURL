import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ShopifyContentManager from "./ShopifyContentManager";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [shop, setShop] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shopParam = params.get("shop");
    const connected = params.get("connected") === "true";

    if (shopParam) {
      setShop(shopParam);
      localStorage.setItem("shopify_shop", shopParam);

      if (connected) {
        setIsConnected(true);
        fetchPages(shopParam);
        navigate("/dashboard", { replace: true });
      } else {
        checkConnectionStatus(shopParam);
      }
    } else {
      const savedShop = localStorage.getItem("shopify_shop");
      if (savedShop) {
        setShop(savedShop);
        checkConnectionStatus(savedShop);
      } else {
        setLoading(false);
      }
    }
  }, [location, navigate]);

  const checkConnectionStatus = async (shopDomain) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/connection/status?shop=${shopDomain}`
      );
      setIsConnected(response.data.connected);

      if (response.data.connected) {
        fetchPages(shopDomain);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
      setError("Failed to check connection status");
      setLoading(false);
    }
  };

  const fetchPages = async (shopDomain) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/shopify/pages`, {
        headers: {
          shop: shopDomain,
        },
        withCredentials: true,
      });

      setPages(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pages:", error);
      setError("Failed to fetch pages");
      setLoading(false);
    }
  };

  const connectToShopify = () => {
    if (!shop) {
      setError("Please enter a shop domain");
      return;
    }

    const shopDomain = shop.includes(".myshopify.com")
      ? shop
      : `${shop}.myshopify.com`;

    window.location.href = `${API_BASE_URL}/auth/shopify?shop=${shopDomain}`;
  };

  const handlePageSelect = (e) => {
    setSelectedPageId(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Shopify Content Editor
      </h1>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {!isConnected ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Connect to your Shopify Store
          </h2>
          <div className="mb-4">
            <label
              htmlFor="shop"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shop Domain:
            </label>
            <input
              type="text"
              id="shop"
              placeholder="yourstore.myshopify.com"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              className="w-full border px-3 py-2 rounded shadow-sm focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            onClick={connectToShopify}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition"
          >
            Connect Store
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Connected to: <span className="text-blue-600">{shop}</span>
            </h2>
            <button
              onClick={() => {
                localStorage.removeItem("shopify_shop");
                setIsConnected(false);
                setShop("");
                setPages([]);
                setSelectedPageId("");
              }}
              className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded"
            >
              Disconnect Store
            </button>
          </div>

          <div className="mb-4">
            <label
              htmlFor="pageSelect"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select a Page to Edit:
            </label>
            <select
              id="pageSelect"
              value={selectedPageId}
              onChange={handlePageSelect}
              className="w-full border px-3 py-2 rounded shadow-sm"
            >
              <option value="">-- Select a page --</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </div>

          {selectedPageId && (
            <div className="mt-8">
              <ShopifyContentManager shop={shop} pageId={selectedPageId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
