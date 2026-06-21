"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CartContextType {
  itemCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType>({ itemCount: 0, refreshCart: () => {} });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = async () => {
    if (!session?.user) { setItemCount(0); return; }
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItemCount(data.length ?? 0);
      }
    } catch {
      setItemCount(0);
    }
  };

  useEffect(() => { refreshCart(); }, [session]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
