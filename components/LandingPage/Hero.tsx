import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Star, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <Badge className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          🔄 Product Swapping Platform
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Swap Products, Build Community with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Swappify
          </span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
          The marketplace where indie founders exchange products, share resources, and build meaningful connections.
          Trade your digital products with fellow entrepreneurs and grow your business network.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-3">
            Watch Demo
          </Button>
        </div>
        <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-slate-500">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span>4.9/5 Rating</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>10,000+ Users</span>
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-green-500 mr-1" />
            <span>Enterprise Security</span>
          </div>
        </div>
      </div>
    </section>
  );
}
