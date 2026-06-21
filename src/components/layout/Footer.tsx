import Link from "next/link";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#08080d] border-t border-[#2a2a3a] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
                <Package size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">Unravel Studio</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Professional 3D art, characters, and environment assets. Crafting digital worlds one polygon at a time.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Explore</h4>
            <ul className="space-y-2">
              {[["Portfolio", "/"], ["Products", "/products"], ["Services", "/services"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Account</h4>
            <ul className="space-y-2">
              {[["Sign In", "/login"], ["Register", "/register"], ["My Orders", "/orders"], ["Downloads", "/downloads"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#2a2a3a] flex items-center justify-between text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} Unravel Studio. All rights reserved.</span>
          <Link href="https://www.artstation.com/ramkumarragul" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
            ArtStation
          </Link>
        </div>
      </div>
    </footer>
  );
}
