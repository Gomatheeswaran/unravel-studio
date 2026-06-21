"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Portfolio" },
    { href: "/products", label: "Products" },
    { href: "/services", label: "Services" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">Unravel Studio</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {session?.user && (
              <Link href="/cart" className="relative p-2 text-gray-300 hover:text-white transition-colors">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#2a2a3a] transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#13131a] border border-[#2a2a3a] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#2a2a3a]">
                      <p className="text-sm font-medium text-white">{session.user.name}</p>
                      <p className="text-xs text-gray-400">{session.user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/orders" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2a2a3a] transition-colors">
                        <User size={16} /> My Orders
                      </Link>
                      <Link href="/downloads" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2a2a3a] transition-colors">
                        <Package size={16} /> Downloads
                      </Link>
                      {session.user.role === "admin" && (
                        <Link href="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-[#2a2a3a] transition-colors">
                          <Settings size={16} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => { setUserOpen(false); signOut(); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#2a2a3a] transition-colors"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5">
                  Login
                </Link>
                <Link href="/register" className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#2a2a3a] py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2a2a3a] rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
