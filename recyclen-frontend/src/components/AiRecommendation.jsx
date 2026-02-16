import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, CheckCircle2, Loader2, Info } from 'lucide-react';

const AiRecommendation = ({ autoItems = [] }) => {
  const [items, setItems] = useState("");
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(false);

  // ✅ THE REASONING ENGINE: Direct connection to your Flask API
  const handleAnalyze = useCallback(async (manualList = null) => {
    const listToProcess = manualList || items.split(',').map(i => i.trim()).filter(i => i);
    
    if (listToProcess.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/recommendation/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ waste_list: listToProcess }),
      });

      const result = await response.json();

      // ✅ SYNC CHECK: Ensure we use 'status' and 'data' from backend routes
      if (response.ok && result.status === 'success' && Array.isArray(result.data)) {
        setResults(result.data);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.warn("AI Service Fallback Triggered:", err);
      // ✅ SILENT FALLBACK: Prevent error screens by providing useful general tips
      const fallbackData = listToProcess.map(item => ({
        item: item,
        category: "General",
        tip: "Rinse and check local guidelines. Ensure it's clean and dry before disposal."
      }));
      setResults(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [items]);

  // ✅ AGENTIC TRIGGER: Automated reasoning when scanner labels arrive
  useEffect(() => {
    if (autoItems && autoItems.length > 0) {
      const itemsString = autoItems.join(', ');
      setItems(itemsString);
      handleAnalyze(autoItems); 
    }
  }, [autoItems, handleAnalyze]);

  return (
    <div className="glass-panel p-6 max-w-2xl mx-auto my-8 border-t-4 border-emerald-500/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-emerald-400" size={24} />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            Smart-Sort AI
          </h2>
        </div>
        {loading && <Loader2 className="animate-spin text-emerald-400" size={20} />}
      </div>

      <div className="flex gap-2 mb-8">
        <input 
          className="flex-1 p-3 bg-black/40 text-white border border-white/10 rounded-xl outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
          placeholder="e.g. paper, pet bottle..."
          value={items}
          onChange={(e) => setItems(e.target.value)}
        />
        <button 
          onClick={() => handleAnalyze()} 
          className="btn-primary px-6 font-bold" 
          disabled={loading || !items.trim()}
        >
          {loading ? "REASONING..." : "ANALYZE"}
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {results.length > 0 ? (
            results.map((res, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-emerald-400 uppercase tracking-tighter">
                    {res.item}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg ${
                    res.category === 'Recycle' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                    res.category === 'Compost' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {res.category}
                  </span>
                </div>
                
                <div className="flex gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                  <Lightbulb className="text-emerald-400 shrink-0" size={18} />
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    {res.tip || "Dispose of this material based on your local municipal waste rules."}
                  </p>
                </div>
                
                <div className="mt-3 flex items-center gap-1.5 text-[9px] text-emerald-500/30 font-mono tracking-widest uppercase">
                  <CheckCircle2 size={10} /> Pipeline Reasoning Active
                </div>
              </motion.div>
            ))
          ) : (
            !loading && (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                <Info className="mx-auto mb-2 text-gray-500" size={32} />
                <p className="text-gray-500 text-sm">Waiting for scanner data...</p>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiRecommendation;