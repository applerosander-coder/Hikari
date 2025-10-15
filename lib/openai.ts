import OpenAI from "openai";

// Using gpt-4o for faster, cheaper AI descriptions with vision support
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateDescriptionParams {
  base64Image?: string;
  itemTitle?: string;
}

export async function generateProductDescription({
  base64Image,
  itemTitle,
}: GenerateDescriptionParams): Promise<string> {
  try {
    // Build the content array based on what's available
    const content: any[] = [];

    // Add text prompt
    if (itemTitle && base64Image) {
      content.push({
        type: "text",
        text: `Generate a compelling auction description for this item titled: "${itemTitle}". Analyze the image and describe what makes this item special and worth bidding on.`,
      });
    } else if (itemTitle) {
      content.push({
        type: "text",
        text: `Generate a compelling auction description for an item titled: "${itemTitle}". Create an engaging description based on the title that encourages bidding.`,
      });
    } else if (base64Image) {
      content.push({
        type: "text",
        text: `Analyze this image and generate a compelling auction description. Describe what makes this item special and worth bidding on.`,
      });
    }

    // Add image if available
    if (base64Image) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
        },
      });
    }

    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert e-commerce product description writer for auction listings. Create compelling, detailed descriptions that:
- Highlight key features, materials, colors, and condition${base64Image ? ' visible in the image' : ''}
- Use persuasive language that encourages bidding
- Stay between 50-100 words
- Focus on what makes the item valuable and desirable
${base64Image ? '- Be specific about what you see in the image' : '- Use creative language to make the item appealing'}`,
        },
        {
          role: "user",
          content,
        },
      ],
      max_tokens: 200,
    });

    return visionResponse.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate description: ${error.message}`);
  }
}
