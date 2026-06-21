export interface ArtStationProject {
  id: number;
  title: string;
  slug: string;
  permalink: string;
  cover_url: string;
  smaller_square_cover_url: string;
  description: string;
  categories: Array<{ name: string; id: number }>;
  published_at: string;
  likes_count: number;
  views_count: number;
  assets?: Array<{
    id: number;
    image_url?: string;
    player_embedded?: string;
    asset_type: string;
    title: string;
  }>;
}

export interface ArtStationUser {
  username: string;
  full_name: string;
  headline: string;
  bio: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  projects_count: number;
  location: string;
  skills_list: string;
}

export async function fetchArtStationProjects(
  username: string,
  page = 1
): Promise<{ data: ArtStationProject[]; total_count: number }> {
  const res = await fetch(
    `https://www.artstation.com/users/${username}/projects.json?page=${page}`,
    {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UnravelStudio/1.0)",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch ArtStation projects");
  return res.json();
}

export async function fetchArtStationUser(
  username: string
): Promise<ArtStationUser> {
  const res = await fetch(
    `https://www.artstation.com/users/${username}.json`,
    {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UnravelStudio/1.0)",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch ArtStation user");
  return res.json();
}

export async function fetchArtStationProjectDetail(
  username: string,
  slug: string
): Promise<ArtStationProject> {
  const res = await fetch(
    `https://www.artstation.com/projects/${slug}.json`,
    {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UnravelStudio/1.0)",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch project detail");
  return res.json();
}
