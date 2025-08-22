import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fileUrl, caption } = await req.json();

    if (!fileUrl || !caption) {
      return NextResponse.json({ error: "Missing file or caption" }, { status: 400 });
    }

    // Here you connect to Ayrshare API with *your API key*
    const response = await fetch("https://app.ayrshare.com/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer AF1849F0-6FE746B2-8091E370-379C4E9A", // Your key
      },
      body: JSON.stringify({
        post: caption,
        mediaUrls: [fileUrl],
        platforms: ["twitter", "facebook", "linkedin", "instagram", "tiktok"], // All supported
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to post" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
