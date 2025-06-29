import React, { useState, useRef, useEffect } from 'react';
import Result from './Result';
import './ScanWaste.css';

const ScanWaste = ({ onResult }) => {
  const [mode, setMode] = useState('upload'); // 'upload' or 'webcam'
  // eslint-disable-next-line no-unused-vars
  const [selectedFile, setSelectedFile] = useState(null); // keep to avoid breaking code if needed
  const [previewSrc, setPreviewSrc] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (mode === 'webcam') {
      startWebcam();
    } else {
      stopWebcam();
    }
    // Cleanup on unmount
    return () => {
      stopWebcam();
    };
  }, [mode]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      setError('Error accessing webcam: ' + err.message);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setStreaming(false);
    }
  };

  const captureImage = () => {
    if (!streaming) {
      setError('Webcam not started');
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
      if (video && canvas) {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewSrc(dataUrl);
        setSelectedFile(null);
        setResult(null);
        setError('');
        // Stop webcam after capture
        stopWebcam();
        // Hide video element after capture
        if (videoRef.current) {
          videoRef.current.style.display = 'none';
        }
      }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSrc(reader.result);
        setResult(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!previewSrc) {
      setError('Please select or capture an image to upload.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const base64Image = previewSrc;
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload image');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setResult(data);
      if (onResult) {
        onResult(data);
      }
    } catch (err) {
      setError('Error uploading image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scan-waste-container">
      <h2>Scan Waste</h2>
      <div className="button-group">
        <button
          className={`button button-upload ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          Upload Image
        </button>
        <button
          className={`button button-webcam ${mode === 'webcam' ? 'active' : ''}`}
          onClick={() => setMode('webcam')}
        >
          Webcam
        </button>
      </div>

      {mode === 'upload' && (
        <>
          <input type="file" accept="image/*" onChange={handleFileChange} className="input-file" />
        </>
      )}

      {mode === 'webcam' && (
        <div>
          <video ref={videoRef} autoPlay playsInline className="video" />
          <div>
            <button onClick={captureImage} className="button-capture">
              Capture
            </button>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {previewSrc && (
        <div className="preview">
          <img src={previewSrc} alt="Selected" />
        </div>
      )}

      <button
        onClick={handleUpload}
        className="button-upload-scan"
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload and Scan'}
      </button>

      {error && <p className="error-message">{error}</p>}

      {result && <Result result={result} />}
    </div>
  );
};

export default ScanWaste;
