import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { Shield, Mail, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Shield size={28} className="text-primary" strokeWidth={2.5} />
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white">Clear</span>
                  <span className="text-lg font-bold text-primary">Pick</span>
                  <span className="text-sm font-semibold text-primary/70">.ai</span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              AI-powered product research for smarter shopping decisions.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin size={16} />
              </a>
              <a href="mailto:support@clearpick.ai" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Mail size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/product-intel" className="text-gray-400 hover:text-white transition-colors">Product Intelligence</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><a href="mailto:business@clearpick.ai" className="text-gray-400 hover:text-white transition-colors">Business Inquiries</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2025 ClearPick.ai. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Made with ❤️ for smarter shopping decisions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
