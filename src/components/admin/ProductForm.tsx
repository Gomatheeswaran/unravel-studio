"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, X, Upload, ImagePlus, Loader2 } from "lucide-react";

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

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload/image", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const { url } = await res.json();
  return url as string;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "0",
    isFree: product?.isFree ?? false,
    category: product?.category ?? "",
    tags: product?.tags ? (JSON.parse(product.tags) as string[]).join(", ") : "",
    thumbnail: product?.thumbnail ?? "",
    model3dUrl: product?.model3dUrl ?? "",
  });

  const [images, setImages] = useState<string[]>(
    product?.images ? (JSON.parse(product.images) as string[]) : []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string; size: number; type: string }[]>([]);
  const [error, setError] = useState("");

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // ── Thumbnail upload ──────────────────────────────────────────────
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, thumbnail: url }));
    } catch {
      setError("Thumbnail upload failed");
    } finally {
      setUploadingThumbnail(false);
      e.target.value = "";
    }
  };

  // ── Gallery image upload ──────────────────────────────────────────
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      setError("Gallery image upload failed");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  // ── Downloadable asset upload ─────────────────────────────────────
  const uploadProductFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingFiles(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    fd.append("folder", "products");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadedFiles((prev) => [...prev, ...(data.files ?? [])]);
    setUploadingFiles(false);
    e.target.value = "";
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const tagsArr = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      isFree: form.isFree,
      category: form.category || null,
      tags: tagsArr,
      thumbnail: form.thumbnail,
      images,
      model3dUrl: form.model3dUrl || null,
    };

    const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save product"); setLoading(false); return; }

    for (const file of uploadedFiles) {
      await fetch("/api/products/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: data.id ?? product!.id,
          fileName: file.name,
          filePath: file.path,
          fileType: file.type,
          fileSize: file.size,
        }),
      });
    }

    setLoading(false);
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Input
        label="Product Name"
        id="name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <Textarea
        label="Description"
        id="desc"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Category"
          id="cat"
          placeholder="Character, Environment..."
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <Input
          label="Tags (comma separated)"
          id="tags"
          placeholder="rigged, PBR, lowpoly..."
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
      </div>

      {/* Free/Paid */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFree}
            onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
            className="w-4 h-4 accent-purple-600"
          />
          <span className="text-sm text-gray-300">Free Product</span>
        </label>
        {!form.isFree && (
          <Input
            label=""
            id="price"
            type="number"
            step="0.01"
            placeholder="Price (USD)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-36"
          />
        )}
      </div>

      {/* ── Thumbnail ─────────────────────────────────────────────── */}
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-1.5">
          Thumbnail <span className="text-red-400">*</span>
        </label>

        <div className="flex gap-3 items-start">
          {/* Preview */}
          {form.thumbnail && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#2a2a3a] shrink-0 bg-[#1a1a24]">
              <Image
                src={form.thumbnail}
                alt="Thumbnail preview"
                fill
                className="object-cover"
                sizes="96px"
                onError={() => setForm((p) => ({ ...p, thumbnail: "" }))}
              />
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, thumbnail: "" }))}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex-1 space-y-2">
            {/* Upload button */}
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={uploadingThumbnail}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2a2a3a] hover:border-purple-500/50 rounded-lg px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {uploadingThumbnail ? (
                <><Loader2 size={16} className="animate-spin" /> Uploading...</>
              ) : (
                <><ImagePlus size={16} /> Upload image</>
              )}
            </button>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailUpload}
            />

            {/* URL fallback */}
            <Input
              id="thumb"
              placeholder="…or paste an image URL"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ── Product Gallery Images ─────────────────────────────────── */}
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-1.5">
          Product Gallery Images
        </label>

        {/* Existing images row */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[#2a2a3a] bg-[#1a1a24]">
                <Image
                  src={img}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={uploadingGallery}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2a2a3a] hover:border-purple-500/50 rounded-lg px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 mb-2"
        >
          {uploadingGallery ? (
            <><Loader2 size={16} className="animate-spin" /> Uploading...</>
          ) : (
            <><ImagePlus size={16} /> Upload gallery images (select multiple)</>
          )}
        </button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleGalleryUpload}
        />

        {/* URL fallback */}
        <div className="flex gap-2">
          <Input
            id="newImg"
            placeholder="…or paste an image URL and click +"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={addImageUrl} size="sm">
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <Input
        label="3D Model URL (optional)"
        id="model3d"
        placeholder="URL to .glb or .obj file"
        value={form.model3dUrl}
        onChange={(e) => setForm({ ...form, model3dUrl: e.target.value })}
      />

      {/* ── Downloadable Files ─────────────────────────────────────── */}
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-1.5">Downloadable Files</label>
        <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#2a2a3a] hover:border-purple-500/50 rounded-lg p-4 cursor-pointer transition-colors">
          <Upload size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">
            {uploadingFiles ? "Uploading..." : "Click to upload files (.blend, .fbx, .obj, .exr, .png, .jpeg, .alm)"}
          </span>
          <input
            type="file"
            multiple
            accept=".jpeg,.jpg,.png,.exr,.blend,.alm,.fbx,.obj,.glb,.gltf"
            className="hidden"
            onChange={uploadProductFiles}
            disabled={uploadingFiles}
          />
        </label>
        {uploadedFiles.length > 0 && (
          <div className="mt-2 space-y-1">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2">
                <span className="text-xs text-white">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-400 ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {product?.files && product.files.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Existing files:</p>
            {product.files.map((f) => (
              <div key={f.id} className="flex items-center bg-[#0f0f18] border border-[#2a2a3a] rounded-lg px-3 py-2 mb-1">
                <span className="text-xs text-gray-400">{f.fileName} (.{f.fileType})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
