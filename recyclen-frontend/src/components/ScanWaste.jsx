import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Bot, 
  Sparkles, 
  Cpu, 
  RefreshCw,
  CheckCircle2,
  ScanLine,
  AlertCircle
} from 'lucide-react';
import Result from './Result'; 
import AiRecommendation from './AiRecommendation'; 
import './ScanWaste.css';

const ScanWaste = ({ onResult }) => {
  const [mode, setMode] = useState('upload'); 
  const [previewSrc, setPreviewSrc] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pipelineStep, setPipelineStep] = useState(0); 
  const [aiLogs, setAiLogs] = useState([]);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (mode === 'webcam') startWebcam();
    else stopWebcam();
    return () => stopWebcam();
  }, [mode]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Camera access denied.');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSrc(reader.result);
        setResult(null);
        setPipelineStep(0);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
  if (!previewSrc) return;

  setLoading(true);
  setError('');
  setPipelineStep(1);
  setAiLogs(["> Initializing Sensing Layer (YOLOv8)..."]);

  try {
    // Convert base64 previewSrc to File
    const res = await fetch(previewSrc);
    const blob = await res.blob();

    const file = new File([blob], "waste.jpg", { type: blob.type });

    const formData = new FormData();
    formData.append("image", file);   // MUST be "image"

    const response = await fetch("http://127.0.0.1:5000/image/upload", {
      method: "POST",
      body: formData,   // NO headers here
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    setResult(data);
    setPipelineStep(3);
    setLoading(false);

    if (onResult) onResult(data);

  } catch (err) {
    setError(err.message);
    setLoading(false);
    setPipelineStep(0);
  }
};


  const resetScanner = () => {
    setPreviewSrc(null);
    setResult(null);
    setPipelineStep(0);
    setAiLogs([]);
    setError('');
  };

  return (
    <div className="scanner-container">
      <div className="glass-panel input-panel">
        <div className="panel-header">
          <h2><ScanLine size={20} /> Image Input</h2>
          <div className="toggle-pill">
            <button className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}>Upload</button>
            <button className={mode === 'webcam' ? 'active' : ''} onClick={() => setMode('webcam')}>Camera</button>
          </div>
        </div>

        <div className="preview-area">
          {mode === 'upload' && !previewSrc && (
            <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
              <UploadCloud size={48} className="icon-fade" />
              <p>Upload Waste Image</p>
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
            </div>
          )}
          {previewSrc && (
            <div className="image-preview">
              <img src={previewSrc} alt="Preview" />
              {loading && <div className="scan-laser" />}
            </div>
          )}
        </div>

        {previewSrc && !loading && !result && (
          <button className="analyze-btn" onClick={handleAnalyze}>
            <Sparkles size={18} /> Start AI Analysis
          </button>
        )}
        {error && <div className="error-box"><AlertCircle size={14} /> {error}</div>}
      </div>

      <div className="glass-panel output-panel">
        <div className="panel-header"><h2><Bot size={20} /> Intelligence Hub</h2></div>
        {pipelineStep < 3 ? (
          <div className="empty-state">
            <Cpu size={40} className={loading ? "animate-pulse" : ""} />
            <h3>{loading ? "Sensing Layer Active" : "System Ready"}</h3>
            {aiLogs.map((log, i) => <p key={i} className="log-text">{log}</p>)}
          </div>
        ) : (
          <div className="result-container">
            <div className="success-banner"><CheckCircle2 size={20} /> Analysis Complete</div>
            <Result result={result} />
            {/* ✅ Bridging Sensing results to Reasoning Layer (Gemini) */}
            <AiRecommendation autoItems={result.detected_objects?.map(obj => obj.class) || []} />
            <button className="reset-all-btn" onClick={resetScanner}>New Scan</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanWaste;