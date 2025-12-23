// client/src/components/Layout/Layout.jsx - UPDATED
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar'; // Left sidebar
import RightSidebar from './RightSidebar'; // Right sidebar
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-container">
        <Sidebar /> {/* Left sidebar */}
        <main className="main-content">
          <Outlet /> {/* This renders Home.jsx content */}
        </main>
        <RightSidebar /> {/* Right sidebar */}
      </div>
    </div>
  );
};

export default Layout;