"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Heart, Eye } from "lucide-react";
import type { ArtStationProject } from "@/lib/artstation";

export function PortfolioGrid() {
  const [projects, setProjects] = useState<ArtStationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProjects = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolio?page=${p}`);
      const data = await res.json();
      if (p === 1) {
        setProjects(data.data ?? []);
      } else {
        setProjects((prev) => [...prev, ...(data.data ?? [])]);
      }
      setTotal(data.total_count ?? 0);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(1); }, []);

  if (loading && projects.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[#13131a] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Portfolio unavailable. Visit <a href="https://www.artstation.com/ramkumarragul" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">ArtStation</a> directly.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square bg-[#13131a] rounded-xl overflow-hidden card-hover border border-[#2a2a3a] hover:border-purple-500/50"
          >
            <Image
              src={project.cover_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white text-sm font-medium line-clamp-1">{project.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-300">
                    <Heart size={12} /> {project.likes_count}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-300">
                    <Eye size={12} /> {project.views_count?.toLocaleString()}
                  </span>
                  <ExternalLink size={12} className="ml-auto text-purple-400" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {projects.length < total && (
        <div className="text-center mt-8">
          <button
            onClick={() => { const next = page + 1; setPage(next); fetchProjects(next); }}
            disabled={loading}
            className="px-6 py-3 bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
