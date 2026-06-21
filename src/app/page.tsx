import { HeroSection } from "@/components/home/HeroSection";
import { PortfolioGrid } from "@/components/home/PortfolioGrid";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Portfolio</h2>
            <p className="text-gray-400 mt-1">Selected works from ArtStation</p>
          </div>
          <a
            href="https://www.artstation.com/ramkumarragul"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All on ArtStation <ArrowRight size={16} />
          </a>
        </div>
        <PortfolioGrid />
      </section>

      {/* CTA Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-3">Browse Assets</h3>
            <p className="text-gray-400 mb-6">Download free and premium 3D models, textures, and asset packs for your projects.</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
          <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-3">Commission Work</h3>
            <p className="text-gray-400 mb-6">Need custom 3D art? Get a quote for characters, environments, or any digital asset.</p>
            <Link href="/services" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              View Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
