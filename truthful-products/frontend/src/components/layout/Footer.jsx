import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface-2 text-ink py-14 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Shield size={28} className="text-mint-600" strokeWidth={2.5} />
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-ink">Clear</span>
                  <span className="text-lg font-bold text-mint-700">Pick</span>
                  <span className="text-sm font-semibold text-slate-500">.ai</span>
                </div>
              </div>
            </div>
            <p className="text-slate-600 mb-4">
              AI-powered product research for smarter shopping decisions.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-border hover:bg-mint-50 transition-colors">
                <Twitter size={16} className="text-slate-700" />
              </a>
              <a href="#" className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-border hover:bg-mint-50 transition-colors">
                <Linkedin size={16} className="text-slate-700" />
              </a>
              <a href="mailto:support@clearpick.ai" className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-border hover:bg-mint-50 transition-colors">
                <Mail size={16} className="text-slate-700" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-600 hover:text-mint-700 transition-colors">Product Intelligence</Link></li>
              <li><Link to="/about" className="text-slate-600 hover:text-mint-700 transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-slate-600 hover:text-mint-700 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-600 hover:text-mint-700 transition-colors">Contact</Link></li>
              <li><a href="mailto:business@clearpick.ai" className="text-slate-600 hover:text-mint-700 transition-colors">Business Inquiries</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-slate-600 hover:text-mint-700 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-600 hover:text-mint-700 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-slate-600 hover:text-mint-700 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; 2025 ClearPick.ai. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Made for smarter shopping decisions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
