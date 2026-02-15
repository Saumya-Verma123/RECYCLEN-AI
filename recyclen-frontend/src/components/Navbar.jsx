import React, { useState } from 'react'
import { TbCameraPlus } from "react-icons/tb";
import { LuHistory } from "react-icons/lu";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { FaHome, FaRecycle } from "react-icons/fa";
import { FaMapMarkedAlt } from "react-icons/fa";


import { FaRobot } from "react-icons/fa";

const menuItems = [
  { name: "Home", icon: <FaHome /> },
  {name: "Scan Waste", icon: <TbCameraPlus/>},
  { name: "Result", icon: <FaRecycle /> },
  { name: "Recycling Map", icon: <FaMapMarkedAlt /> }, 
  { name: "History", icon: <LuHistory /> },
  { name: "Chatbot", icon: <FaRobot /> },
 
];

const Navbar = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="navbar-container">
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
        <div className="sidebar-header">
          <FaRecycle />
          {isOpen && <span className="brand-text">Recyclens</span>}
        </div>
        {/* Toggle Button */}
        <div className="toggle-button-container">
          <button onClick={() => setIsOpen(!isOpen)} className="toggle-button">
            {isOpen ? <TbLayoutSidebarLeftCollapseFilled /> : <BsReverseLayoutTextSidebarReverse />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="menu-nav">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`menu-item ${selected === item.name ? "selected" : ""}`}
              onClick={() => onSelect(item.name)}
              style={{ cursor: "pointer" }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className={`menu-text ${isOpen ? "" : "hidden"}`}>{item.name}</span>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
