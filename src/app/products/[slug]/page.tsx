"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import dynamic from "next/dynamic";
import { ProductViewer2D } from "@/components/products/ProductViewer2D";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatFileSize, getFileIcon } from "@/lib/utils";
import { ShoppingCart, Download, Package, Box, ChevronLeft } from "lucide-react";
import Link from "next/link";

const ProductViewer3D = dynamic(
  () => import("@/components/products/ProductViewer3D").then((m) => m.ProductViewer3D),
  { ssr: false, loading: () => <div className="aspect-square bg-[#0f0f18] rounded-xl animate-pulse flex items-center justify-center text-gray-500">Loading 3D viewer...</div> }
);

interface ProductFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  isFree: boolean;
  category: string | null;
  tags: string | null;
  thumbnail: string;
  images: string;
  model3dUrl: string | null;
  files: ProductFile[];
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { refreshCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"2d" | "3d">("2d");
  const [adding, setAdding] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products?search=${slug}`)
      .then((r) => r.json())
      .then((products: Product[]) => {
        const found = products.find((p) => p.name.toLowerCase().replace(/\s+/g, "-") === slug) ?? products[0];
        if (found) setProduct(found);
        else fetch(`/api/products`)
          .then((r) => r.json())
          .then((all: Product[]) => setProduct(all.find((p) => p.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug) ?? null));
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!product || !session?.user) return;
    fetch("/api/cart").then((r) => r.json()).then((items: { productId: string }[]) => {
      setInCart(items.some((i) => i.productId === product.id));
    });
    fetch(`/api/orders/purchases?productId=${product.id}`).then((r) => r.json()).then((d) => {
      setPurchased(d.purchased ?? false);
    });
  }, [product, session]);

  const handleAddToCart = async () => {
    if (!session?.user) { router.push("/login"); return; }
    setAdding(true);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product!.id }),
    });
    setInCart(true);
    refreshCart();
    setAdding(false);
  };

  const handleDownload = async (fileId?: string) => {
    if (!product) return;
    setDownloading(fileId ?? "all");
    const url = `/api/products/${product.id}/download${fileId ? `?fileId=${fileId}` : ""}`;
    const a = document.createElement("a");
    a.href = url;
    a.click();
    setTimeout(() => setDownloading(null), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-[#13131a] rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-[#13131a] rounded w-3/4" />
            <div className="h-4 bg-[#13131a] rounded" />
            <div className="h-4 bg-[#13131a] rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Product not found.</p>
        <Link href="/products" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  const images = JSON.parse(product.images || "[]") as string[];
  const allImages = product.thumbnail ? [product.thumbnail, ...images.filter((i) => i !== product.thumbnail)] : images;
  const tags = product.tags ? JSON.parse(product.tags) as string[] : [];
  const canDownload = product.isFree || purchased;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={16} /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Viewer */}
        <div>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-[#13131a] border border-[#2a2a3a] rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab("2d")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "2d" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Package size={14} /> 2D View
            </button>
            {product.model3dUrl && (
              <button
                onClick={() => setTab("3d")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === "3d" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Box size={14} /> 3D View
              </button>
            )}
          </div>

          {tab === "2d" ? (
            <ProductViewer2D images={allImages} name={product.name} />
          ) : (
            product.model3dUrl && <ProductViewer3D modelUrl={product.model3dUrl} />
          )}
        </div>

        {/* Right: Info */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
            <Badge variant={product.isFree ? "free" : "paid"}>
              {product.isFree ? "Free" : formatPrice(product.price)}
            </Badge>
          </div>

          {product.category && (
            <p className="text-sm text-purple-400 mb-4">{product.category}</p>
          )}

          <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag: string) => (
                <span key={tag} className="bg-[#1a1a24] border border-[#2a2a3a] text-gray-400 text-xs px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price & Actions */}
          <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-white">
                {product.isFree ? "Free" : formatPrice(product.price)}
              </span>
            </div>

            {canDownload ? (
              <Button
                onClick={() => handleDownload()}
                loading={downloading === "all"}
                size="lg"
                className="w-full"
              >
                <Download size={18} className="mr-2" />
                Download {product.isFree ? "" : "(Purchased)"}
              </Button>
            ) : session?.user ? (
              <Button
                onClick={inCart ? () => router.push("/cart") : handleAddToCart}
                loading={adding}
                size="lg"
                className="w-full"
              >
                <ShoppingCart size={18} className="mr-2" />
                {inCart ? "View in Cart" : "Add to Cart"}
              </Button>
            ) : (
              <Button onClick={() => router.push("/login")} size="lg" className="w-full">
                Sign in to Purchase
              </Button>
            )}
          </div>

          {/* Files List */}
          {product.files.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Included Files ({product.files.length})
              </h3>
              <div className="space-y-2">
                {product.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-[#13131a] border border-[#2a2a3a] rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getFileIcon(file.fileType)}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{file.fileName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)} · .{file.fileType}</p>
                      </div>
                    </div>
                    {canDownload && (
                      <button
                        onClick={() => handleDownload(file.id)}
                        disabled={downloading === file.id}
                        className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
