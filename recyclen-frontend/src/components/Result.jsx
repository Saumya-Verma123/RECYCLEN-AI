import React from 'react';
import './Result.css';

const Result = ({ result }) => {
  // Global safety check
  if (!result) {
    return <div className="result-container"><p>No scan result available.</p></div>;
  }

  const backendBaseUrl = "http://127.0.0.1:5000";

  // Safety: Initialize detectedObjects as an array
  const detectedObjects = result.detected_objects || [];

  return (
    <div className="result-container">
      <h2>Scan Result</h2>
      <div className="result-layout">
        <div className="object-info">
          <p>Detected Objects:</p>
          <ul>
            {detectedObjects.length > 0 ? (
              detectedObjects.map((obj, index) => (
                <li key={index} className="object-card">
                  <strong>{obj.class}</strong> ({(obj.confidence * 100).toFixed(1)}%)
                  <span className={`tag ${obj.category?.toLowerCase() || 'unknown'}`}>
                    {obj.category || "Unclassified"}
                  </span>
                  {/* AI Suggestion integration */}
                  {obj.suggestion && <p className="ai-tip">💡 {obj.suggestion}</p>}
                </li>
              ))
            ) : (
              <li>No objects detected</li>
            )}
          </ul>
        </div>

        <div className="image-comparison">
          {result.original_image && (
            <div className="img-box">
              <p>Original</p>
              <img src={`${backendBaseUrl}${result.original_image}`} alt="Original" />
            </div>
          )}
          {result.annotated_image && (
            <div className="img-box">
              <p>Analysis</p>
              <img src={`${backendBaseUrl}${result.annotated_image}`} alt="Annotated" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Result;