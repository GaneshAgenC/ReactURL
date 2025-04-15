import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ShopifyContentManager = ({ shop, pageId }) => {
  const [loading, setLoading] = useState(true);
  const [pageContent, setPageContent] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [selectedContent, setSelectedContent] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [enhancementType, setEnhancementType] = useState("improve");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchPageContent = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/api/content/content/${pageId}`,
        {
          headers: { shop },
          withCredentials: true,
        }
      );

      setPageTitle(response.data.title);
      setPageContent(response.data.content);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching page content:", error);
      setMessage({
        text: "Failed to load page content. Please try again.",
        type: "error",
      });
      setLoading(false);
    }
  }, [pageId, shop]);

  useEffect(() => {
    if (shop && pageId) fetchPageContent();
  }, [shop, pageId, fetchPageContent]);

  const handleContentSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText) {
      setMessage({
        text: "Please select some content to enhance",
        type: "warning",
      });
      return;
    }

    setSelectedContent(selectedText);
    setMessage({ text: "", type: "" });
  };

  const requestAiSuggestion = async () => {
    if (!selectedContent) {
      setMessage({
        text: "Please select content first",
        type: "warning",
      });
      return;
    }

    try {
      setProcessing(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/content/suggest`,
        {
          selectedContent,
          context: pageTitle,
          enhancement: enhancementType,
        },
        {
          headers: { shop },
          withCredentials: true,
        }
      );

      setAiSuggestion(response.data.suggestion);
      setProcessing(false);
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      setMessage({
        text: "Failed to get AI suggestions. Please try again.",
        type: "error",
      });
      setProcessing(false);
    }
  };

  const applyContentChange = async () => {
    if (!selectedContent || !aiSuggestion) {
      setMessage({
        text: "Please select content and generate AI suggestions first",
        type: "warning",
      });
      return;
    }

    try {
      setProcessing(true);

      const response = await axios.put(
        `${API_BASE_URL}/api/content/update/${pageId}`,
        {
          originalContent: selectedContent,
          newContent: aiSuggestion,
          fullPageContent: pageContent,
        },
        {
          headers: { shop },
          withCredentials: true,
        }
      );

      await fetchPageContent();

      setSelectedContent("");
      setAiSuggestion("");
      setMessage({
        text: "Content updated successfully!",
        type: "success",
      });
      setProcessing(false);
    } catch (error) {
      console.error("Error updating content:", error);
      setMessage({
        text: "Failed to update content. Please try again.",
        type: "error",
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        Loading page content...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">{pageTitle}</h1>

      {message.text && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content View */}
        <div>
          <h3 className="text-xl font-medium mb-2">Page Content</h3>
          <p className="text-sm text-gray-600 mb-2">
            Select text to enhance with AI:
          </p>
          <div
            onMouseUp={handleContentSelection}
            className="border rounded-md p-4 bg-white shadow-sm h-[400px] overflow-y-auto text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(pageContent),
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Selected Content */}
          <div>
            <h3 className="text-lg font-medium mb-2">Selected Content</h3>
            <div className="border rounded-md p-3 bg-gray-50 text-sm min-h-[100px]">
              {selectedContent || "No content selected"}
            </div>
          </div>

          {/* Enhancement Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Enhancement Type:
            </label>
            <select
              className="w-full border rounded px-3 py-2 bg-white"
              value={enhancementType}
              onChange={(e) => setEnhancementType(e.target.value)}
            >
              <option value="improve">Improve Writing</option>
              <option value="simplify">Simplify Language</option>
              <option value="persuasive">Make More Persuasive</option>
              <option value="seo">Optimize for SEO</option>
            </select>

            <button
              onClick={requestAiSuggestion}
              disabled={!selectedContent || processing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded disabled:opacity-50 transition"
            >
              {processing ? "Generating..." : "Generate AI Suggestions"}
            </button>
          </div>

          {/* AI Suggestion */}
          <div>
            <h3 className="text-lg font-medium mb-2">AI Suggestion</h3>
            <div className="border rounded-md p-3 bg-gray-50 text-sm min-h-[100px]">
              {aiSuggestion || "AI suggestions will appear here"}
            </div>
          </div>

          <button
            onClick={applyContentChange}
            disabled={!selectedContent || !aiSuggestion || processing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded disabled:opacity-50 transition"
          >
            {processing ? "Applying..." : "Apply Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopifyContentManager;
