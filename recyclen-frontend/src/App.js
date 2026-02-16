import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  ScanLine, 
  MapPin, 
  Home, 
  Sparkles, 
  Info,
  Clock
} from 'lucide-react';
import './App.css';

// --- Component Imports ---
import ScanWaste from './components/ScanWaste';
import Result from './components/Result';
import AiRecommendation from './components/AiRecommendation'; // ✅ Matches your filename
import History from './components/History';
import RecyclingMap from "./components/RecyclingMap";

// --- Hero Component (The Front Page) ---
const Hero = ({ onStart }) => {
  return (
    <div className="hero-wrapper">
      <div className="hero-overlay-gradient" />
      <div className="hero-content">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-text-section"
        >
          <div className="badge-pill">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>POWERING A GREENER FUTURE</span>
          </div>
          
          <h1 className="hero-title">
            Redefining Value. <br />
            <span className="text-gradient">Restoring Our Future.</span>
          </h1>
          
          <p className="hero-description">
            Waste isn't just trash—it's a resource waiting to be reclaimed. 
            <strong> Recyclens</strong> bridges the gap between individual action and 
            global impact, empowering society to build a zero-waste world together.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={onStart}>
              <ScanLine size={20} />
              Start Scanning 
            </button>
            <button className="btn-secondary">
              Our Mission <Info size={18} />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-visual"
        >
          <div className="glass-card-visual">
             <div className="scanned-image-container">
               <img 
                 src="https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg"
                 alt="Waste Detection Visual" 
                 className="scanned-object"
               />
               <div className="grid-overlay"></div>
             </div>
             <div className="scan-line-anim"></div>
             <div className="visual-info">
               <div className="info-row">
                 <span className="label">RECYCLABILITY</span>
                 <span className="value text-accent">HIGH POTENTIAL</span>
               </div>
               <div className="progress-bar">
                 <div className="progress-fill" style={{ width: '92%' }}></div>
               </div>
               <div className="text-right mt-1 text-[10px] text-emerald-400 font-mono">92% CONFIDENCE</div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  const [selectedMenu, setSelectedMenu] = useState('Home');
  const [scanResult, setScanResult] = useState(null);
  
  // ✅ THE PIPELINE STATE: Connects Scanner output to AI Reasoning
  const [autoWasteList, setAutoWasteList] = useState([]);

  // ✅ PIPELINE TRIGGER: Called automatically when Scanner finishes
  const handleScanComplete = (res) => {
    setScanResult(res);
    
    // Extract detected labels for the AI Agentic reasoning
    const detectedNames = res.detected_objects?.map(obj => obj.class) || [];
    setAutoWasteList(detectedNames); // Pipes names to AiRecommendation
    
    setSelectedMenu('Result'); // Switch to results view
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'History': 
        return <History />;
      case 'Scan Waste': 
        return <ScanWaste onResult={handleScanComplete} />;
      case 'Result': 
        return (
          <div className="flex flex-col gap-6">
            <Result result={scanResult} />
            {/* ✅ AGENTIC LINK: Automated Reasoning follows the detection */}
            {autoWasteList.length > 0 && (
              <AiRecommendation autoItems={autoWasteList} />
            )}
          </div>
        );
      case 'Recycling Map': 
        return <RecyclingMap />;
      case 'AI Recommend': 
        // Manual mode for AI Recommendations
        return <AiRecommendation />; 
      case 'Home': 
      default: 
        return <Hero onStart={() => setSelectedMenu('Scan Waste')} />;
    }
  };

  return (
    <div className="app-root">
      {/* Navigation Bar */}
      <nav className="glass-nav">
        <div className="nav-container">
          <div className="logo-container" onClick={() => setSelectedMenu('Home')}>
            <Leaf className="text-emerald-400" />
            <span className="logo-text uppercase tracking-widest">RECYCLENS</span>
          </div>

          <div className="desktop-menu">
            <button 
              onClick={() => setSelectedMenu('Home')} 
              className={`nav-link ${selectedMenu === 'Home' ? 'active' : ''}`}
            >
              <Home size={18} /> Home
            </button>
            <button 
              onClick={() => setSelectedMenu('Scan Waste')} 
              className={`nav-link ${selectedMenu === 'Scan Waste' ? 'active' : ''}`}
            >
              <ScanLine size={18} /> Scanner
            </button>
            
            {/* ✅ SMART SORT: Dedicated entry point for AI reasoning */}
            <button 
              onClick={() => setSelectedMenu('AI Recommend')} 
              className={`nav-link ${selectedMenu === 'AI Recommend' ? 'active' : ''}`}
            >
              <Sparkles size={18} /> Smart Sort
            </button>

            <button 
              onClick={() => setSelectedMenu('Recycling Map')} 
              className={`nav-link ${selectedMenu === 'Recycling Map' ? 'active' : ''}`}
            >
              <MapPin size={18} /> Find Centers
            </button>
            <button 
              onClick={() => setSelectedMenu('History')} 
              className={`nav-link ${selectedMenu === 'History' ? 'active' : ''}`}
            >
              <Clock size={18} /> My Impact
            </button>
          </div>
        </div>
      </nav>

      <main className="main-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMenu}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="content-wrapper"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;