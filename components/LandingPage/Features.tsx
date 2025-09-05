import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Shield, Smartphone, Star, Users, Zap } from "lucide-react";

const features = [
  {
    title: "Easy Product Listing",
    description:
      "List your digital products quickly with our intuitive interface. Upload, describe, and start swapping in minutes.",
    icon: Zap,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Secure Transactions",
    description:
      "Trade with confidence using our secure escrow system and verified founder profiles for safe product exchanges.",
    icon: Shield,
    gradient: "from-green-500 to-green-600",
  },
  {
    title: "Founder Community",
    description:
      "Connect with like-minded indie founders, share experiences, and build lasting business relationships.",
    icon: Users,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    title: "Smart Matching",
    description:
      "Our algorithm matches you with relevant swap opportunities based on your products and interests.",
    icon: Smartphone,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "Global Network",
    description:
      "Access a worldwide community of indie founders from different industries and backgrounds.",
    icon: Globe,
    gradient: "from-teal-500 to-teal-600",
  },
  {
    title: "Fair Exchange",
    description:
      "Our valuation system ensures fair trades with transparent pricing and community-driven reviews.",
    icon: Star,
    gradient: "from-pink-500 to-pink-600",
  },
] as const;

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-slate-50 dark:bg-slate-800">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Why Indie Founders Love Swapify
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            The perfect platform for entrepreneurs to exchange products, build relationships, and grow together
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Card
                key={idx}
                className="group hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:-translate-y-1"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${f.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">{f.title}</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">{f.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
