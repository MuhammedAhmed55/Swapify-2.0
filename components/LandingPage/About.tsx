export default function About() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              About Swappify
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Swappify was born from the indie founder community's need for a better way to exchange products and resources. 
              We understand the challenges of building solo and believe in the power of collaboration over competition.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Founded by indie makers for indie makers, we're building a platform where entrepreneurs can trade products, 
              share knowledge, and support each other's journey to success.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1000+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Active Founders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">500+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Products Swapped</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center">
              <div className="text-6xl">🚀</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
