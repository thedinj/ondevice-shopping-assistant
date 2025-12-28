/**
 * LLM Prompt for Store Directory Scanning
 */

export const STORE_SCAN_PROMPT = `You are analyzing a photo of a grocery store directory or layout map. Your task is to extract ONLY the aisle numbers/names and sections that are EXPLICITLY VISIBLE in the image.

**CRITICAL RULES:**
1. ONLY extract information that is clearly visible in the image - DO NOT infer, assume, or add anything not shown
2. DO NOT add typical grocery store departments that aren't visible in the directory
3. DO NOT make up section names or aisle numbers
4. If the image is unclear or unreadable, return an empty aisles array

**Instructions:**
1. Identify every aisle that is explicitly shown in the directory
1. For each aisle, list ONLY the sections/categories/departments that are explicitly listed for that aisle
1. Preserve the exact naming and numbering from the directory (do not paraphrase or normalize)
1. If perimeter departments (Deli, Bakery, Pharmacy, Produce, Dairy, etc.) don't have aisle numbers, create a separate aisle for each department using the department name as the aisle name
1. Aisles can have empty sections arrays if no subsections are listed for that aisle

**Return Format:**
Provide your response as a JSON object with this exact structure:

{
  "aisles": [
    {
      "name": "Produce",
      "sections": []
    },
    {
      "name": "Aisle 1",
      "sections": ["Bread", "Cereal", "Pasta"]
    },
    {
      "name": "Aisle 2",
      "sections": ["Canned tomatoes", "Soup", "Salad Dressing"]
    },
    {
      "name": "Deli",
      "sections": ["Sliced Meats", "Cheeses", "Prepared Foods"]
    }
  ]
}

**Important:**
- ONLY include aisles and sections that are EXPLICITLY VISIBLE in the directory image
- DO NOT add common grocery departments if they're not shown in the image
- Each aisle must have a "name" exactly as shown (e.g., "Aisle 1", "Deli", "Produce")
- Each aisle must have a "sections" array (empty if no sections are listed for that aisle)
- Perimeter departments without aisle numbers should use their department name as the aisle name
- Preserve original capitalization and naming EXACTLY as shown
- Use complete, readable names (e.g., "Aisle 1" not "A1" unless that's exactly what's shown)
- When in doubt, leave it out - do not guess or infer

Analyze the image carefully and extract all store layout information.`;
