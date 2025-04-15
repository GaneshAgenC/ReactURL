import { useState, useEffect } from "react";
import axios from "axios";

export const useShopifyContent = () => {
  const [pages, setPages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Shopify content
  const fetchContent = async () => {
    const accessToken = localStorage.getItem("shopify_access_token");
    const shopDomain = localStorage.getItem("shopify_shop_domain");

    if (!accessToken || !shopDomain) {
      setError("No Shopify connection found");
      setLoading(false);
      return;
    }

    try {
      // Fetch pages with additional options
      const pagesResponse = await axios.get("/api/shopify/pages", {
        headers: {
          shop: shopDomain,
          accessToken: accessToken,
        },
        params: {
          limit: 100, // Fetch up to 100 pages
          fields: "id,title,body_html,created_at",
        },
      });

      // Fetch blogs and articles
      const blogsResponse = await axios.get("/api/shopify/blogs", {
        headers: {
          shop: shopDomain,
          accessToken: accessToken,
        },
      });

      setPages(pagesResponse.data);
      setBlogs(blogsResponse.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Search content
  const searchContent = async (query) => {
    const accessToken = localStorage.getItem("shopify_access_token");
    const shopDomain = localStorage.getItem("shopify_shop_domain");

    try {
      const response = await axios.get("/api/shopify/search", {
        headers: {
          shop: shopDomain,
          accessToken: accessToken,
        },
        params: { query },
      });

      return response.data;
    } catch (err) {
      console.error("Search failed", err);
      throw err;
    }
  };

  // Update page content
  const updatePageContent = async (pageId, newContent) => {
    const accessToken = localStorage.getItem("shopify_access_token");
    const shopDomain = localStorage.getItem("shopify_shop_domain");

    try {
      const response = await axios.put(
        `/api/shopify/page/${pageId}`,
        { content: newContent },
        {
          headers: {
            shop: shopDomain,
            accessToken: accessToken,
          },
        }
      );

      // Update local state
      setPages((prevPages) =>
        prevPages.map((page) => (page.id === pageId ? response.data : page))
      );

      return response.data;
    } catch (error) {
      console.error("Failed to update page", error);
      throw error;
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchContent();
  }, []);

  return {
    pages,
    blogs,
    loading,
    error,
    fetchContent,
    searchContent,
    updatePageContent,
  };
};
