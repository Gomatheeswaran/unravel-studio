import { NextResponse } from "next/server";
import { fetchArtStationProjects, fetchArtStationUser } from "@/lib/artstation";

const USERNAME = "ramkumarragul";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const type = searchParams.get("type") ?? "projects";

  try {
    if (type === "user") {
      const user = await fetchArtStationUser(USERNAME);
      return NextResponse.json(user);
    }
    const data = await fetchArtStationProjects(USERNAME, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("ArtStation fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data", data: [], total_count: 0 },
      { status: 200 }
    );
  }
}
