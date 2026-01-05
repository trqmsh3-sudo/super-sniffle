import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: December 27, 2025</p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                ClearPick.ai respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Account information (email, name, phone)</li>
                <li>Payment information (via Stripe)</li>
                <li>Usage data (searches, products viewed)</li>
                <li>Device information (IP, browser, OS)</li>
                <li>Cookies and tracking data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide and improve our Service</li>
                <li>Process transactions and subscriptions</li>
                <li>Send updates and support messages</li>
                <li>Analyze usage and optimize experience</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
              <p className="text-gray-700 mb-4">We share data with:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Supabase (authentication & hosting)</li>
                <li>Stripe (payment processing)</li>
                <li>Anthropic (AI analysis - anonymized)</li>
                <li>Analytics providers (anonymized)</li>
              </ul>
              <p className="text-gray-700 mb-4 font-semibold">
                We DO NOT sell your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account</li>
                <li>Export your data</li>
                <li>Opt-out of marketing emails</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Contact: privacy@clearpick.ai
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We use industry-standard security measures including encryption, secure servers, and regular audits.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700">
                Email: privacy@truthfulproducts.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
