import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Clock } from 'lucide-react';
import { Button, Card } from '../components/ui';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-mint-50 to-white" />
      <div className="absolute -z-10 -top-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-mint-200/35 blur-3xl" />
      <div className="absolute -z-10 -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-ink mb-4">Get in Touch</h1>
          <p className="text-xl text-slate-600">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 bg-white">
            <h2 className="text-2xl font-black text-ink mb-6">Send us a Message</h2>
            
            {submitted && (
              <div className="mb-6 p-4 bg-mint-50 border border-mint-200 rounded-2xl">
                <p className="text-mint-800 font-semibold">
                  Thank you! We'll get back to you soon.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="input-field resize-none"
                  placeholder="Tell us more..."
                />
              </div>

              <Button type="submit" className="w-full" size="lg" leftIcon={<Send size={20} />}>
                Send Message
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-8 bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-mint-100 border border-mint-200 rounded-xl flex items-center justify-center">
                  <Mail className="text-mint-700" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink mb-2">Email Us</h3>
                  <p className="text-slate-600 mb-2">
                    For general inquiries and support
                  </p>
                  <a href="mailto:support@clearpick.ai" className="text-mint-800 hover:text-mint-900 font-semibold">
                    support@clearpick.ai
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 border border-cyan-200 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-cyan-700" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink mb-2">Business Inquiries</h3>
                  <p className="text-slate-600 mb-2">
                    Partnerships and enterprise solutions
                  </p>
                  <a href="mailto:business@clearpick.ai" className="text-mint-800 hover:text-mint-900 font-semibold">
                    business@clearpick.ai
                  </a>
                </div>
              </div>
            </Card>

            {/* Quick Response Time (make it crisp; avoid old tokens) */}
            <div className="rounded-2xl p-8 text-white shadow-mint-soft-lg bg-gradient-to-br from-mint-700 to-cyan-600 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-black">Quick Response Time</h3>
              </div>
              <p className="text-white/90 mb-4">
                We typically respond within 24 hours during business days.
              </p>
              <p className="text-sm text-white/80">
                Monday - Friday: 9 AM - 6 PM EST
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
