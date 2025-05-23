// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';  // Import Router
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import RoutesConfig from './routes';  // Import Routes
import './App.css';

function App() {
  return (
    <Router> {/* Bao bọc tất cả component trong Router */}
      <div className="App">
        <Header />
        <Hero />
        <RoutesConfig />  {/* Điều hướng giữa các trang */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
