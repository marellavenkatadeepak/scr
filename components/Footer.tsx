import React from 'react';
import { Shield } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-slate-100">
              <Shield className="w-6 h-6" />
              <span className="text-lg font-bold">ClearVoice</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Empowering employees to create better workplaces through safe, anonymous, and verified feedback.
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
              🔒 Secured by InsForge
            </div>
          </div>

          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Insights</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Report an Issue</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Ethics Statement</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} ClearVoice Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <span>Made with trust.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;