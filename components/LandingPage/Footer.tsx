import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Swappify</span>
            </div>
            <p className="text-slate-400 text-sm">
              Connecting indie founders through product swapping and community building.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 Swappify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
