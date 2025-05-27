// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';  // Import Router
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import RoutesConfig from './routes';  // Import Routes
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      "'Segoe UI'", 'Arial', 'Helvetica', 'sans-serif'
    ].join(','),
  },
});

function App() {
  return (

    <ThemeProvider theme={theme}>
      <Router> {/* Bao bọc tất cả component trong Router */}
        <div className="App">
          <Header />
          <Hero />
          <RoutesConfig />  {/* Điều hướng giữa các trang */}
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
