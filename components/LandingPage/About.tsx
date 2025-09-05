import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightLeft, Users, Package, Star } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-20 px-6 bg-white dark:bg-slate-900">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            About Swapify
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Built by indie founders, for indie founders. We understand the challenges of building solo 
            and believe in the power of collaboration over competition.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Swapify was born from the indie founder community's need for a better way to exchange products and resources. 
              We're building a platform where entrepreneurs can trade products, share knowledge, and support each other's journey to success.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              From SaaS tools to digital courses, from design assets to marketing resources - our platform enables 
              founders to access the tools they need while sharing their own creations with the community.
            </p>
          </div>
          <div className="relative">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-8">
                <div className="aspect-square bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                  <div className="text-6xl">🚀</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Founders</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">1,000+</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Products Listed</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">2,500+</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                  <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Successful Swaps</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">500+</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                  <ArrowRightLeft className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Community Rating</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">4.9/5</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                  <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
