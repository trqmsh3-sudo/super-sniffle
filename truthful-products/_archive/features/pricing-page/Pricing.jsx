import React, { useState } from 'react';
import { Mail, Clock, ShieldCheck } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

const Pricing = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-mint-50 to-white" />
      <div className="absolute -z-10 -top-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-mint-200/35 blur-3xl" />
      <div className="absolute -z-10 -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="text-center">
          <Badge variant="neutral">Coming soon</Badge>
          <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight text-ink">
            We’re not charging yet.
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            ClearPick is still in early validation. For now the only “plan” is:
            use it, give feedback, and join the waitlist.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-mint-100 border border-mint-200 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-mint-700" />
              </div>
              <div>
                <div className="font-black text-ink">No hype</div>
                <div className="text-sm text-slate-600">We only ship what works.</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center">
                <Clock className="h-5 w-5 text-cyan-700" />
              </div>
              <div>
                <div className="font-black text-ink">Fast iterations</div>
                <div className="text-sm text-slate-600">Weekly improvements.</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                <Mail className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <div className="font-black text-ink">Get early access</div>
                <div className="text-sm text-slate-600">First invites go to waitlist.</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-10">
          <Card className="p-8">
            <h2 className="text-2xl font-black text-ink">Join the Waitlist</h2>
            <p className="mt-2 text-slate-600">
              We’ll email you when access opens. No spam.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-mint-200 bg-mint-50 p-4 text-mint-800 font-semibold">
                ✅ You’re on the list!
              </div>
            ) : (
              <form
                name="waitlist"
                method="POST"
                data-netlify="true"
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col sm:flex-row gap-3"
              >
                <input type="hidden" name="form-name" value="waitlist" />
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 input-field h-12"
                />
                <Button type="submit" size="lg" leftIcon={<Mail className="h-5 w-5" />}>
                  Join Waitlist
                </Button>
              </form>
            )}

            <div className="mt-6 text-sm text-slate-500">
              Pricing will only be introduced after we validate product-market fit.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
