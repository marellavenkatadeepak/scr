import React from 'react';
import { Shield, EyeOff, Lock, Database } from 'lucide-react';

const PrivacySection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4">
                    <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    Built with a Privacy-First Architecture
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    We don't just promise anonymity; we enforce it technically.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                    <Database className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">Secured by InsForge</h3>
                    <p className="text-sm text-slate-500">
                        We use strict Row-Level Security (RLS) policies. Even our developers cannot access your private chat data.
                    </p>
                </div>
                <div className="text-center">
                    <EyeOff className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">Zero Surveillance</h3>
                    <p className="text-sm text-slate-500">
                        No tracking pixels. No ad IDs. No selling data to third parties. You are the customer, not the product.
                    </p>
                </div>
                <div className="text-center">
                    <Lock className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">One-Way Hashing</h3>
                    <p className="text-sm text-slate-500">
                        Your email is used for login, then salted and hashed. It is decoupled from your activity logs permanently.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;