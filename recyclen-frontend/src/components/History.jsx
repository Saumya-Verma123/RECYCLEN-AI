import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Archive, 
  AlertCircle, 
  Clock, 
  Hash, 
  Layers,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/history/detections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: "guest" }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      
      // ✅ SAFETY CHECK: Prevent crashes if data is null or not an array
      if (!data || !Array.isArray(data)) {
        setHistory([]);
        return;
      }

      const mappedData = data.map((item) => {
        // --- Date Logic ---
        let date = "Unknown Date";
        if (item.timestamp) {
           let parsedDate = new Date(item.timestamp);
           if (isNaN(parsedDate)) parsedDate = new Date(Number(item.timestamp));
           if (!isNaN(parsedDate)) {
             date = parsedDate.toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', 
                hour: '2-digit', minute: '2-digit'
             });
           }
        }

        // --- Image URL Logic ---
        let imageUrl = item.original_image_url || item.original_image;
        if (imageUrl) {
          const fileName = imageUrl.replace(/\\/g, '/').split('/').pop();
          imageUrl = `http://localhost:5000/static/uploads/${fileName}`;
        } else {
          imageUrl = "https://placehold.co/400x300/022c22/34d399?text=No+Image";
        }

        const detectedObjects = item.detected_objects || [];

        return {
          id: item._id || item.image_id || "UNK",
          displayId: (item.image_id || item._id || "").toString().substring(0, 8),
          date,
          imageUrl,
          // ✅ AGENTIC LOGIC: Extract the AI's reasoning stored in the DB
          wasteItems: detectedObjects.map(obj => ({
            name: obj.class,
            tip: obj.ai_suggestion || obj.suggestion || obj.tip || "Follow general disposal rules.",
            category: obj.ai_category || obj.category || "General"
          })),
          count: detectedObjects.length,
          confidence: detectedObjects[0] ? Math.round(detectedObjects[0].confidence * 100) : 0
        };
      });

      setHistory(mappedData); 
    } catch (error) {
      console.error('History Fetch Error:', error);
      setHistory([]); 
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id, index) => {
    if (!window.confirm("Delete this scan record?")) return;
    try {
      const response = await fetch('http://localhost:5000/history/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: id, user_id: "guest" }),
      });
      if (response.ok) {
        const newHistory = [...history];
        newHistory.splice(index, 1);
        setHistory(newHistory);
      }
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

  return (
    <div className="history-page">
      <div className="history-container glass-panel">
        <div className="history-header">
          <div className="header-title">
            <Archive size={28} className="text-emerald-400" />
            <div>
              <h2>Analysis Archive</h2>
              <span className="badge">{(history || []).length} Records Found</span>
            </div>
          </div>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="loading-state">Syncing with Cloud...</div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>Your recycling journey starts here.</p>
            </div>
          ) : (
            <div className="history-grid">
              <AnimatePresence>
                {history.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    className="history-card"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="card-image">
                      <img src={item.imageUrl} alt="Scan Result" />
                      <div className="card-overlay">
                        <span className="date-pill"><Clock size={12} /> {item.date}</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card-meta">
                         <span className="id-tag"><Hash size={12} /> {item.displayId}</span>
                         <span className="count-tag"><Layers size={12} /> {item.count} Items</span>
                      </div>

                      {/* ✅ PIPELINE DATA: Displaying the AI reasoning log */}
                      <div className="history-items-list">
                        {item.wasteItems.map((waste, i) => (
                          <div key={i} className="history-item-detail">
                            <div className="flex justify-between">
                                <span className="waste-pill">{waste.name}</span>
                                <span className="category-text text-[10px] text-emerald-500 uppercase font-bold">{waste.category}</span>
                            </div>
                            <p className="history-tip">
                                <Lightbulb size={12} className="inline mr-1" /> {waste.tip}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="card-footer">
                         <span className="status-text"><CheckCircle2 size={14} /> VERIFIED BY AI</span>
                         <button onClick={() => removeItem(item.id, index)} className="delete-btn">
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ REQUIRED EXPORT
export default History;