import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo size="default" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-navy-light hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <Link to="/product-intel" className="text-navy-light hover:text-primary font-medium transition-colors">
              Product Intelligence
            </Link>
            <Link to="/pricing" className="text-navy-light hover:text-primary font-medium transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-navy-light hover:text-primary font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-navy-light hover:text-primary font-medium transition-colors">
              Contact
            </Link>
            <button className="btn-secondary text-sm px-4 py-2">
              Sign In
            </button>
          </nav>

          <button className="md:hidden text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
