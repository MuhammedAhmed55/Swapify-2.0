import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Star, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto text-center">
        <Badge className="mb-6 bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          🔄 Product Swapping Platform
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
          Swap Products, Build Community with{" "}
          <span className="text-slate-900 dark:text-white">
            Swapify
          </span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-3xl mx-auto">
          The marketplace where indie founders exchange products, share resources, and build meaningful connections.
          Trade your digital products with fellow entrepreneurs and grow your business network.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-lg px-8 py-3 font-medium">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            Watch Demo
          </Button>
        </div>
        <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-slate-400 mr-2" />
            <span>4.9/5 Rating</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 text-slate-400 mr-2" />
            <span>1,000+ Founders</span>
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-slate-400 mr-2" />
            <span>Secure Platform</span>
          </div>
        </div>
      </div>
    </section>
  );
}
