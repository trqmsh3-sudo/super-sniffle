import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: December 27, 2025</p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using ClearPick.ai ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                ClearPick.ai provides AI-powered product research and analysis services. We aggregate data from various sources including Amazon, Reddit, and other platforms to provide comprehensive product insights.
              </p>
              <p className="text-gray-700 mb-4">
                The Service is provided "as is" and "as available" without any warranties of any kind.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Usage Limits and Subscription Plans</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Tier</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>10 product searches per day</li>
                <li>Access to all basic features</li>
                <li>No credit card required</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Pro Tier ($7.99/month)</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>100 product searches per day</li>
                <li>Search history</li>
                <li>Save favorite products</li>
                <li>Priority support</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Tier ($29.99/month)</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>500 product searches per day</li>
                <li>API access</li>
                <li>Bulk research capabilities</li>
                <li>Advanced analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                Paid subscriptions are billed monthly in advance. You authorize us to charge your payment method on a recurring basis.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>All fees are in U.S. dollars</li>
                <li>Subscriptions automatically renew unless canceled</li>
                <li>No refunds for partial months</li>
                <li>You can cancel anytime from your account settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Acceptable Use Policy</h2>
              <p className="text-gray-700 mb-4">You agree NOT to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to circumvent usage limits</li>
                <li>Scrape, copy, or redistribute our data</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use automated tools to access the Service (bots, scrapers)</li>
                <li>Share your account credentials with others</li>
                <li>Resell or commercialize the Service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content, features, and functionality of the Service are owned by ClearPick.ai and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700 mb-4">
                Product data and reviews are aggregated from public sources and remain the property of their respective owners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Accuracy and Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                While we strive to provide accurate and up-to-date information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Product information may be outdated or incorrect</li>
                <li>Prices and availability change frequently</li>
                <li>AI analysis is for informational purposes only</li>
                <li>We are not responsible for purchase decisions made based on our data</li>
                <li>Always verify information on the retailer's website</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Affiliate Disclosure</h2>
              <p className="text-gray-700 mb-4">
                ClearPick.ai participates in affiliate programs including Amazon Associates. We may earn commissions from qualifying purchases made through links on our Service. This does not affect our analysis or recommendations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLEARPICK.AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
              </p>
              <p className="text-gray-700 mb-4">
                Our total liability shall not exceed the amount you paid us in the past 12 months, or $100, whichever is greater.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our sole discretion.
              </p>
              <p className="text-gray-700 mb-4">
                You may cancel your account at any time from your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> legal@clearpick.ai<br />
                <strong>Address:</strong> [Your Business Address]
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
