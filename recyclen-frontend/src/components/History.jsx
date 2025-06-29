import React, { useState, useEffect } from 'react';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/history/detections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        console.error('Failed to fetch history');
        return;
      }
      const data = await response.json();
      console.log("Fetched history data:", data);
      // Map backend data to frontend format
      console.log("Raw history data:", data);
      const mappedData = data.map((item) => {
            let date = "Unknown Date";
            if (item.timestamp) {
              console.log("Raw timestamp:", item.timestamp);
              // Improved date parsing with timezone fallback
              let parsedDate = new Date(item.timestamp);
              if (isNaN(parsedDate)) {
                parsedDate = new Date(item.timestamp + "Z");
              }
              if (isNaN(parsedDate)) {
                parsedDate = new Date(Number(item.timestamp));
              }
              if (!isNaN(parsedDate)) {
                date = parsedDate.toLocaleDateString('en-GB');
              }
            }
        let imageUrl = item.original_image_url;
        if (imageUrl && !imageUrl.startsWith("http")) {
          let normalizedPath = imageUrl.replace(/\\\\/g, '/').replace(/\\/g, '/');
          if (!normalizedPath.startsWith('/')) {
            normalizedPath = '/' + normalizedPath;
          }
          imageUrl = "http://localhost:5000" + normalizedPath;
        }
        if (!imageUrl) {
          imageUrl = "/default-image.jpg";
        }
        let wasteTypes = [];
        if (item.detected_objects && Array.isArray(item.detected_objects) && item.detected_objects.length > 0) {
          wasteTypes = item.detected_objects.map(obj => obj.class || "Unknown");
        }
        if (wasteTypes.length === 0) {
          wasteTypes = ["N/A"];
        }
        return {
          id: item._id || item.id || item.image_id || "Unknown ID",
          date,
          imageUrl,
          wasteTypes,
        };
      });
      setHistory(mappedData);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch('http://localhost:5000/history/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        console.error('Failed to clear history');
        return;
      }
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const removeItem = async (index) => {
    const item = history[index];
    try {
      const response = await fetch('http://localhost:5000/history/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_id: item.id }),
      });
      if (!response.ok) {
        console.error('Failed to delete history item');
        return;
      }
      const newHistory = [...history];
      newHistory.splice(index, 1);
      setHistory(newHistory);
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2 className="history-title">History</h2>
        <button onClick={clearAll} className="clear-button">
          Clear All
        </button>
      </div>
      <div className="history-list">
        {history.length === 0 ? (
          <p className="history-empty">No history available.</p>
        ) : (
          history.map((item, index) => (
            <div key={index} className="history-item">
              <img
                src={item.imageUrl}
                alt={`Waste ${item.id}`}
                className="history-image"
                onError={(e) => { e.target.onerror = null; e.target.src = "/default-image.jpg"; }}
              />
              <div className="history-details">
                <p>
                  Image Id : <strong>{item.id}</strong>
                </p>
                <p>
                  Detection Count <strong>{item.wasteTypes.length}</strong>
                </p>
                <p>Detected Waste Type :</p>
                <div className="waste-tags">
                  {item.wasteTypes.length > 0 ? (
                    item.wasteTypes.map((type, idx) => (
                      <span key={idx} className="waste-tag">
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="waste-tag">N/A</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="remove-button"
                aria-label="Remove item"
              >
                &#x2715;
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* <div className="history-debug">
        <h3>Raw History Data (for debugging):</h3>
        <pre>{JSON.stringify(history, null, 2)}</pre>
      </div> */}
    </div>
  );
};

export default History;
