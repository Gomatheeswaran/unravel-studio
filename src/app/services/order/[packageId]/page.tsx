"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, Upload, X, CheckCircle, CreditCard } from "lucide-react";
import Link from "next/link";

interface ServicePackage {
  id: string;
  tier: string;
  name: string;
  price: number;
  description: string;
  workCoverage: string;
  deliveryDays: number;
}

type Step = "details" | "files" | "payment" | "success";

export default function ServiceOrderPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [pkg, setPkg] = useState<ServicePackage | null>(null);
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [details, setDetails] = useState({
    projectType: "",
    description: "",
    dimensions: "",
    style: "",
    deadline: "",
    additionalNotes: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string; size: number }[]>([]);

  useEffect(() => {
    fetch(`/api/services/${packageId}`)
      .then((r) => r.json())
      .then((d) => setPkg(d));
  }, [packageId]);

  useEffect(() => {
    if (!session && step !== "details") return;
    if (!session) { router.push(`/login?callbackUrl=/services/order/${packageId}`); }
  }, [session, step, packageId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected].slice(0, 10));
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const uploadFiles = async () => {
    if (files.length === 0) return setStep("payment");
    setUploading(true);
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploadedFiles(data.files ?? []);
    setUploading(false);
    setStep("payment");
  };

  const handleCheckout = async () => {
    if (!pkg) return;
    setLoading(true);
    const res = await fetch("/api/checkout/service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: pkg.id,
        projectDetails: details,
        referenceFiles: uploadedFiles,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.orderId) {
      setOrderId(data.orderId);
      setStep("success");
    }
  };

  if (!pkg) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-400">Loading package details...</div>;
  }

  const steps: Step[] = ["details", "files", "payment", "success"];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/services" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={16} /> Back to Services
      </Link>

      {/* Package Summary */}
      <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-400 uppercase font-semibold mb-1">{pkg.tier}</p>
            <h2 className="text-lg font-bold text-white">{pkg.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatPrice(pkg.price)}</p>
            <p className="text-xs text-gray-400">{pkg.deliveryDays} day delivery</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {["Project Details", "Reference Files", "Review & Pay"].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              stepIdx > i ? "bg-green-600 text-white" : stepIdx === i ? "bg-purple-600 text-white" : "bg-[#2a2a3a] text-gray-500"
            }`}>
              {stepIdx > i ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${stepIdx === i ? "text-white" : "text-gray-500"}`}>{label}</span>
            {i < 2 && <div className="h-px flex-1 bg-[#2a2a3a]" />}
          </div>
        ))}
      </div>

      {/* Step: Details */}
      {step === "details" && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-white">Project Details</h3>
          <Input label="Project Type" id="projectType" placeholder="e.g. Character Model, Environment, Props..." value={details.projectType} onChange={(e) => setDetails({ ...details, projectType: e.target.value })} required />
          <Textarea label="Project Description" id="desc" placeholder="Describe your project in detail..." value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} required />
          <Input label="Dimensions / Scale" id="dimensions" placeholder="e.g. 2m tall character, 10x10m environment..." value={details.dimensions} onChange={(e) => setDetails({ ...details, dimensions: e.target.value })} />
          <Input label="Style Reference" id="style" placeholder="e.g. Stylized, Realistic, Sci-Fi, Fantasy..." value={details.style} onChange={(e) => setDetails({ ...details, style: e.target.value })} />
          <Input label="Preferred Deadline" id="deadline" type="date" value={details.deadline} onChange={(e) => setDetails({ ...details, deadline: e.target.value })} />
          <Textarea label="Additional Notes" id="notes" placeholder="Any other requirements, formats needed, etc." value={details.additionalNotes} onChange={(e) => setDetails({ ...details, additionalNotes: e.target.value })} />
          <Button
            onClick={() => setStep("files")}
            disabled={!details.projectType || !details.description}
            size="lg"
            className="w-full"
          >
            Continue to File Upload
          </Button>
        </div>
      )}

      {/* Step: Files */}
      {step === "files" && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-white">Reference Files</h3>
          <p className="text-gray-400 text-sm">Upload reference images, sketches, or inspiration images. Up to 10 files.</p>

          <div
            className="border-2 border-dashed border-[#2a2a3a] hover:border-purple-500/50 rounded-xl p-8 text-center transition-colors cursor-pointer"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <Upload size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-white font-medium">Click to upload files</p>
            <p className="text-gray-500 text-sm mt-1">Images, sketches, reference materials (max 50MB each)</p>
            <input
              id="fileInput"
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-[#13131a] border border-[#2a2a3a] rounded-lg px-4 py-3">
                  <span className="text-sm text-white">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep("details")} className="flex-1">Back</Button>
            <Button onClick={uploadFiles} loading={uploading} size="lg" className="flex-1">
              {files.length === 0 ? "Skip & Continue" : "Upload & Continue"}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Payment */}
      {step === "payment" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Review & Payment</h3>

          <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5 space-y-3">
            <h4 className="font-medium text-white text-sm">Order Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{pkg.name}</span>
              <span className="text-white">{formatPrice(pkg.price)}</span>
            </div>
            <div className="h-px bg-[#2a2a3a]" />
            <div className="flex justify-between font-semibold">
              <span className="text-white">Total</span>
              <span className="text-white">{formatPrice(pkg.price)}</span>
            </div>
          </div>

          <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5 space-y-3">
            <h4 className="font-medium text-white text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-purple-400" /> Payment
            </h4>
            <p className="text-gray-400 text-sm">
              A secure payment link will be generated. You&apos;ll be charged {formatPrice(pkg.price)} upon confirmation.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep("files")} className="flex-1">Back</Button>
            <Button onClick={handleCheckout} loading={loading} size="lg" className="flex-1">
              Confirm & Pay {formatPrice(pkg.price)}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === "success" && (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Order Placed!</h3>
          <p className="text-gray-400 mb-6">
            Your service order has been created and assigned to the studio. You&apos;ll receive updates on your order status.
          </p>
          {orderId && (
            <p className="text-xs text-gray-500 mb-6">Order ID: {orderId}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              View My Orders
            </Link>
            <Link href="/" className="bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
