import React from 'react';
import './Result.css';

const Result = ({ result }) => {
  if (!result) {
    return <p>No scan result available.</p>;
  }

const backendBaseUrl = "http://localhost:5000";

  return (
    <div className="result-container">
      <h2>Scan Result</h2>
      <div>
        <p>Detected Objects:</p>
        <ul>
          {result.detected_objects && result.detected_objects.length > 0 ? (
            result.detected_objects.map((obj, index) => (
              <li key={index}>
                {obj.class} - Confidence: {(obj.confidence * 100).toFixed(2)}%
              </li>
            ))
          ) : (
            <li>No objects detected</li>
          )}
        </ul>
      </div>
      <div className="images">
        <div>
          <p>Original Image:</p>
          {result.original_image ? (
            <img src={`${backendBaseUrl}${result.original_image}`} alt="Original" />
          ) : (
            <p>No original image available</p>
          )}
        </div>
        <div>
          <p>Annotated Image:</p>
          {result.annotated_image ? (
            <img src={`${backendBaseUrl}${result.annotated_image}`} alt="Annotated" />
          ) : (
            <p>No annotated image available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Result;
