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

    const { base64Image } = await request.json();

    if (!base64Image) {
      return NextResponse.json(
        { error: "Please upload an image to generate auction details" },
        { status: 400 }
      );
    }

    const base64Data = base64Image.includes("base64,")
      ? base64Image.split("base64,")[1]
      : base64Image;

    const result = await generateProductDescription({
      base64Image: base64Data,
      itemTitle: undefined,
    });

    console.log('Generated result:', result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}
