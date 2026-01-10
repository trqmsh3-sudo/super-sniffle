import React, { useState } from 'react';
import { Mail, CheckCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';

const Home = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Netlify Forms will handle the submission automatically
    const formData = new FormData(e.target);
    
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    .then(() => {
      console.log('Form submitted successfully');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    })
    .catch((error) => {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again.');
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden flex items-center justify-center px-4">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary"></div>
      
      {/* Animated background blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-[floatBlob_20s_ease-in-out_infinite] -z-10"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-[floatBlob_25s_ease-in-out_infinite_reverse] -z-10"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-[floatBlob_30s_ease-in-out_infinite] -z-10" style={{ animationDelay: '5s' }}></div>
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="flex justify-center mb-12 animate-[fadeInDown_0.8s_ease-out]">
          <Logo size="large" lightMode={true} />
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-white mb-6 animate-slide-up leading-tight">
          Stop Guessing.
          <br />
          <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Start Knowing.
          </span>
        </h1>

        <p className="text-2xl md:text-3xl text-slate-300 mb-4 font-semibold animate-slide-up" style={{animationDelay: '0.1s'}}>
          Truth-Powered Product Intelligence
        </p>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
          We analyze <span className="text-primary-400 font-semibold">real reviews</span> from across the web.
          No BS. No ads. Just honest insights in <span className="text-secondary-400 font-semibold">30 seconds</span>.
        </p>

        <div className="bg-white/5 backdrop-blur-[10px] rounded-2xl p-8 mb-12 border border-white/10 shadow-lg animate-[fadeInUp_1.2s_ease-out_1s_backwards] transition-all duration-400 hover:border-primary/20 hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)]">
          <h2 className="text-3xl font-bold text-white mb-3">
            Get Early Access
          </h2>
          <p className="text-slate-300 mb-6 text-lg">
            Join <span className="text-primary-400 font-semibold">2,847 smart shoppers</span> on the waitlist
          </p>

          {!submitted ? (
            <form 
              name="waitlist" 
              method="POST" 
              data-netlify="true"
              onSubmit={handleSubmit} 
              className="flex flex-col sm:flex-row gap-3"
            >
              <input type="hidden" name="form-name" value="waitlist" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-lg bg-white/5 border-2 border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:shadow-[0_0_20px_rgba(0,255,179,0.3)] focus:-translate-y-0.5 transition-all duration-300"
              />
              <button
                type="submit"
                className="relative overflow-hidden px-8 py-4 bg-primary hover:bg-primary-hover text-bg-primary font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,255,179,0.4)] active:-translate-y-0 active:shadow-[0_6px_20px_rgba(0,255,179,0.3)] group"
              >
                <Mail size={20} className="transition-transform duration-300 group-hover:scale-110" />
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 text-primary text-lg font-semibold py-4 animate-[successPop_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
              <CheckCircle size={24} className="animate-[successPop_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_0.2s_backwards]" />
              <span>Thanks! You're on the list!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-[10px] rounded-xl p-6 border border-white/10 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,255,179,0.2)] hover:border-primary/50">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">AI Analysis</h3>
            <p className="text-text-muted text-sm">
              Unbiased insights powered by advanced AI
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-[10px] rounded-xl p-6 border border-white/10 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,255,179,0.2)] hover:border-primary/50">
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Independent Retailers</h3>
            <p className="text-text-muted text-sm">
              Support small businesses, not just big tech
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-[10px] rounded-xl p-6 border border-white/10 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,255,179,0.2)] hover:border-primary/50">
            <div className="text-4xl mb-3">💎</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">100% Transparent</h3>
            <p className="text-text-muted text-sm">
              No hidden agendas, just honest recommendations
            </p>
          </div>
        </div>

        <div className="text-text-muted mb-8">
          <p className="text-sm">
            Expected Launch: <span className="text-primary font-semibold" style={{ textShadow: '0 0 10px rgba(0, 255, 179, 0.3)' }}>Q1 2026</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-[10px] rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Trusted by shoppers, powered by data from:</h3>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            <svg className="h-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110" viewBox="0 0 120 30" fill="#E0E0E0">
              <text x="0" y="20" fontSize="20" fontWeight="bold">Amazon</text>
            </svg>
            <svg className="h-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110" viewBox="0 0 80 30" fill="#E0E0E0">
              <text x="0" y="20" fontSize="20" fontWeight="bold">eBay</text>
            </svg>
            <svg className="h-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110" viewBox="0 0 120 30" fill="#E0E0E0">
              <text x="0" y="20" fontSize="20" fontWeight="bold">Walmart</text>
            </svg>
            <svg className="h-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110" viewBox="0 0 130 30" fill="#E0E0E0">
              <text x="0" y="20" fontSize="20" fontWeight="bold">Best Buy</text>
            </svg>
            <svg className="h-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110" viewBox="0 0 100 30" fill="#E0E0E0">
              <text x="0" y="20" fontSize="20" fontWeight="bold">Target</text>
            </svg>
          </div>
        </div>

        <div className="text-text-muted mb-4">
          <p className="text-sm mb-2">Questions? Get in touch:</p>
          <a href="mailto:hello@clearpick.ai" className="text-primary hover:text-primary-hover font-semibold transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(0,255,179,0.5)]">
            hello@clearpick.ai
          </a>
        </div>

        <div className="text-text-muted text-sm">
          <p>ClearPick AI © 2025 | Smart Shopping Intelligence</p>
        </div>

        {/* כפתור סודי לכניסת מנהל */}
        <button
          onClick={() => navigate('/admin-login')}
          className="fixed bottom-4 left-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 opacity-30 hover:opacity-100 hover:scale-110 backdrop-blur-[10px] border border-white/10"
          title="Admin Login"
        >
          <Lock size={20} className="text-text-secondary" />
        </button>
      </div>
    </div>
  );
}

export default Home;
