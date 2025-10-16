import OpenAI from "openai";

// Using gpt-4o for faster, cheaper AI descriptions with vision support
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateDescriptionParams {
  base64Image?: string;
  itemTitle?: string;
}

interface GenerateDescriptionResponse {
  title: string;
  description: string;
  category: string;
}

const CATEGORIES = [
  'Electronics',
  'Fashion & Accessories',
  'Services & Experiences',
  'Collectibles & Art',
  'Home & Living',
  'Sports & Hobbies',
  'Other'
];

export async function generateProductDescription({
  base64Image,
  itemTitle,
}: GenerateDescriptionParams): Promise<GenerateDescriptionResponse> {
  try {
    if (!base64Image) {
      throw new Error('Image is required for AI generation');
    }

    const content: any[] = [
      {
        type: "text",
        text: `Analyze this product image and generate auction listing details. Be specific about what you see in the image.`,
      },
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
        },
      }
    ];

    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert e-commerce product description writer for auction listings. 

Analyze the product image and generate:

1. A concise, descriptive title (3-8 words) that identifies the item clearly
   - Be specific about what you see (brand, model, style, material, color)
   - Make it searchable and clear
   - Examples: "Vintage Leather Handbag Brown", "Apple MacBook Pro 16-inch", "Modern Glass Coffee Table"

2. A compelling description (50-100 words) that:
   - Highlights key features, materials, colors, and condition visible in the image
   - Uses persuasive language that encourages bidding
   - Focuses on what makes the item valuable and desirable
   - Is specific about what you see in the image

3. The most appropriate category from this list:
   ${CATEGORIES.join(', ')}

Return your response in this exact JSON format:
{
  "title": "your descriptive title here",
  "description": "your compelling description here",
  "category": "selected category from the list"
}`,
        },
        {
          role: "user",
          content,
        },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const responseText = visionResponse.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseText);
    
    return {
      title: parsed.title || "",
      description: parsed.description || "",
      category: CATEGORIES.includes(parsed.category) ? parsed.category : "Other",
    };
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate description: ${error.message}`);
  }
}
