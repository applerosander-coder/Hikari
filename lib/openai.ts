import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// This is using OpenAI's API, which points to OpenAI's API servers and requires your own API key.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateDescriptionParams {
  base64Image: string;
  itemTitle: string;
}

export async function generateProductDescription({
  base64Image,
  itemTitle,
}: GenerateDescriptionParams): Promise<string> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert e-commerce product description writer for auction listings. Create compelling, detailed descriptions that:
- Highlight key features, materials, colors, and condition visible in the image
- Use persuasive language that encourages bidding
- Stay between 50-100 words
- Focus on what makes the item valuable and desirable
- Be specific about what you see in the image`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate a compelling auction description for this item titled: "${itemTitle}". Analyze the image and describe what makes this item special and worth bidding on.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_completion_tokens: 300,
    });

    return visionResponse.choices[0].message.content || "";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate description: ${error.message}`);
  }
}
