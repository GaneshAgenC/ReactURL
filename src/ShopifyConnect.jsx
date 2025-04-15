import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const ShopifyConnect = () => {
  const [shopDomain, setShopDomain] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth callback when component mounts
  useEffect(() => {
    const handleOAuthCallback = () => {
      // Check if we're on the callback route
      const urlParams = new URLSearchParams(location.search);
      const accessToken = urlParams.get("token");
      const shop = urlParams.get("shop");

      if (accessToken && shop) {
        try {
          // Store token securely
          localStorage.setItem("shopify_access_token", accessToken);
          localStorage.setItem("shopify_shop_domain", shop);

          // Redirect to dashboard or content management page
          navigate("/dashboard");
        } catch (error) {
          console.error("OAuth Callback Error:", error);
          // Handle error (show message, redirect to error page)
          navigate("/connect-error");
        }
      }
    };

    // Call the callback handler
    handleOAuthCallback();
  }, [location, navigate]);

  const initiateShopifyAuth = async () => {
    // Validate shop domain
    if (!shopDomain.trim()) {
      alert("Please enter a valid Shopify store domain");
      return;
    }

    // Normalize shop domain
    const normalizedDomain =
      shopDomain.replace(/https?:\/\//, "").replace(/\.myshopify\.com$/, "") +
      ".myshopify.com";

    // Redirect to backend OAuth initiation
    window.location.href = `http://localhost:5000/auth/shopify?shop=${normalizedDomain}`;
  };

  return (
    <div className="shopify-connect-container">
      <h2>Connect Your Shopify Store</h2>
      <div className="connect-input-group">
        <input
          type="text"
          placeholder="Your Shopify Store Domain"
          value={shopDomain}
          onChange={(e) => setShopDomain(e.target.value)}
          className="shopify-domain-input"
        />
        <button onClick={initiateShopifyAuth} className="connect-button">
          Connect Shopify Store
        </button>
      </div>
      <p className="domain-hint">
        Enter your store's myshopify.com domain (e.g.,
        mystorename.myshopify.com)
      </p>
    </div>
  );
};

export default ShopifyConnect;
