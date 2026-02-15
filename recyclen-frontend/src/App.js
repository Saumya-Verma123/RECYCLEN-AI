import React, { useState } from 'react';
import './App.css';
import { ReactComponent as RecycleLogo } from './logo.svg';
import { ReactComponent as Group3 } from './Group 3.svg';
import { ReactComponent as Group48 } from './Group 48.svg';
import Navbar from './components/Navbar';
import RecyclingMap from "./components/RecyclingMap";
import History from './components/History';
import ScanWaste from './components/ScanWaste';
import Result from './components/Result';


function App() {
  const [selectedMenu, setSelectedMenu] = useState('Home');
  const [scanResult, setScanResult] = useState(null);

  console.log("Selected Menu:", selectedMenu);

  return (
    <div className="app-container flex">
      <Navbar selected={selectedMenu} onSelect={setSelectedMenu} />
      {selectedMenu === 'History' ? (
        <History />
     
      ) : selectedMenu === 'Scan Waste' ? (
        <ScanWaste onResult={setScanResult} />
      ) : selectedMenu === 'Result' ? (
        <Result result={scanResult} />
     
      )
        : selectedMenu === 'Recycling Map' ? (
        <RecyclingMap />
      ) //: selectedMenu === 'Chatbot' ? (
       // <Chatbot />
       : (
        <div className="landing-page">
          <div className="background-skyline">
            <Group48 />
          </div>

          <header className="header">
            <RecycleLogo className="logo" />
            <span className="brand-name">RECYCLENS</span>
          </header>
          <main className="main-content">
            <section className="text-section">
              <h1>
                SCAN THE WASTE <br />
                <strong>SAVE THE PLANET</strong>
              </h1>
              <p>Turn Trash into Impact – Detect, Sort & Act</p>
              <div className="buttons">
                <button className="btn upload-btn">Upload Image</button>
                <button className="btn know-more-btn">Know More</button>
              </div>
            </section>
            <section className="illustration-section">
              <Group3 />
            </section>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
