import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';
import './index.css';
import { UserProvider } from './context/UserContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/calculator" element={<ErrorBoundary><Calculator /></ErrorBoundary>} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App; 