import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Navbar.css';

function Navbar() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when window is resized to desktop size
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>Курьерская Служба</Link>
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu} 
          aria-label="Menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/orders" onClick={closeMenu}>Заказы</Link>
        <Link to="/calculator" onClick={closeMenu}>Калькулятор</Link>
        {user ? (
          <div className="user-menu">
            <span className="welcome-text">Добро пожаловать, {user.name}</span>
            <Link to="/profile" onClick={closeMenu}>Профиль</Link>
          </div>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Войти</Link>
            <Link to="/register" onClick={closeMenu}>Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 