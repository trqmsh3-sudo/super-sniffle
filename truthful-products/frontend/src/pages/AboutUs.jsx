import React from 'react';
import { Shield, Target, Users, Zap } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About ClearPick.ai</h1>
          <p className="text-xl text-blue-100">
            Making online shopping smarter with AI-powered product research
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-navy mb-8 text-center">Our Mission: Restoring Truth to Online Shopping</h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <h3 className="text-2xl font-bold text-primary mb-4">The Problem</h3>
              <p className="text-lg text-navy-light leading-relaxed">
                Today, shopping online feels like navigating a minefield of fake reviews, sponsored rankings, and endless options. It's no longer about finding the best product; it's about figuring out who to trust.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <h3 className="text-2xl font-bold text-primary mb-4">Our Story</h3>
              <p className="text-lg text-navy-light leading-relaxed">
                ClearPick.ai was born out of a simple frustration: Why is it so hard to get an honest answer? We realized that while the internet is full of data, it's lacking in <strong>clarity</strong>. We decided to build an independent intelligence layer—a tool that works for the buyer, not the seller.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-mint-light/10 rounded-xl p-8 border-2 border-primary">
              <h3 className="text-2xl font-bold text-navy mb-6">Our Commitment to You</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy mb-2">Independent & Unbiased</h4>
                    <p className="text-navy-light">
                      We are not owned by any retailer. Our algorithms don't care which brand you buy; they only care about which one is actually better.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy mb-2">Data-Driven Truth</h4>
                    <p className="text-navy-light">
                      We scan thousands of real user experiences across Reddit, specialized forums, and verified purchase histories to filter out the noise and the "bot" reviews.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy mb-2">Built for Your Wallet</h4>
                    <p className="text-navy-light">
                      Our AI doesn't just look at ratings; it looks at <strong>value</strong>. We find the products that actually deliver on their promises, saving you time and money.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-8">
              <p className="text-xl text-navy-light italic mb-4">
                "We believe that when you have the right information, you make better choices. At ClearPick.ai, we do the research, so you can shop with confidence."
              </p>
              <p className="text-primary font-semibold text-lg">
                Shop smarter, not harder. – The ClearPick Team
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why We're Different</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Shield className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unbiased</h3>
              <p className="text-gray-600">
                No sponsored content. Just honest analysis from real reviews.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-green/10 rounded-full mb-4">
                <Zap className="text-accent-green" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Advanced AI analyzes thousands of reviews in seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Target className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive</h3>
              <p className="text-gray-600">
                Data from Amazon, Reddit, and more in one place.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-green/10 rounded-full mb-4">
                <Users className="text-accent-green" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">User-Focused</h3>
              <p className="text-gray-600">
                Built for shoppers who want the truth, not marketing.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for a Product</h3>
                  <p className="text-gray-600">
                    Enter any product name and we'll find it across multiple sources.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-gray-600">
                    Our AI reads thousands of reviews and discussions to extract key insights.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Your Answer</h3>
                  <p className="text-gray-600">
                    Receive a clear verdict with pros, cons, pricing, and recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-600">
                We show you where our data comes from and how we analyze it.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accuracy</h3>
              <p className="text-gray-600">
                We constantly update our data to give you the most current information.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy</h3>
              <p className="text-gray-600">
                Your searches are private. We never sell your data.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop Smarter?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of smart shoppers making better purchase decisions
          </p>
          <a 
            href="/product-intel" 
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Researching
          </a>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
