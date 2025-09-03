import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Swappify
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#about" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
            About
          </Link>
          <Link href="#contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center space-x-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
