import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { Button } from '../ui';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo size="default" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-700 hover:text-mint-700 font-medium transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-slate-700 hover:text-mint-700 font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-slate-700 hover:text-mint-700 font-medium transition-colors">
              Contact
            </Link>
            <Link to="/">
              <Button size="sm">Analyze →</Button>
            </Link>
          </nav>

          <button className="md:hidden text-slate-700">
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
