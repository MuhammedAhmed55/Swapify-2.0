import Link from "next/link";
import { Zap, ArrowRightLeft, Users, Package } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 dark:border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-slate-900" />
              </div>
              <span className="text-lg font-bold text-white">Swapify</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting indie founders through product swapping and community building. 
              Trade, collaborate, and grow together.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-3 h-3" />
                <span>1000+ Founders</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Package className="w-3 h-3" />
                <span>2500+ Products</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#features" className="hover:text-white transition-colors flex items-center gap-2">
                <ArrowRightLeft className="w-3 h-3" />
                How It Works
              </Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link></li>
              <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Community</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Founder Stories</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Success Cases</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Newsletter</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              &copy; 2024 Swapify. All rights reserved. Built with ❤️ by indie founders.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>Made for founders, by founders</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
