import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server';
import { generateProductDescription } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in to use AI features' },
        { status: 401 }
      );
    }

    const { base64Image, itemTitle } = await request.json();

    // Require at least one of image or title
    if (!base64Image && !itemTitle) {
      return NextResponse.json(
        { error: "Please provide either an image or item title" },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present (only if image exists)
    const base64Data = base64Image && base64Image.includes("base64,")
      ? base64Image.split("base64,")[1]
      : base64Image;

    const description = await generateProductDescription({
      base64Image: base64Data,
      itemTitle,
    });

    console.log('Generated description:', description);
    return NextResponse.json({ description });
  } catch (error: any) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}
