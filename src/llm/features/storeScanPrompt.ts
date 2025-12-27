/**
 * LLM Prompt for Store Directory Scanning
 */

export const STORE_SCAN_PROMPT = `You are analyzing a photo of a grocery store directory or layout map. Your task is to extract ALL aisle numbers/names and their corresponding sections or categories.

**Instructions:**
1. Identify every aisle shown in the directory
2. For each aisle, list all sections/categories/departments it contains
3. Preserve the exact naming and numbering from the directory
4. If perimeter departments (Deli, Bakery, Pharmacy, etc.) don't have aisle numbers, group them under "Perimeter" or "Service Departments"
5. If sections span multiple aisles, include them in each relevant aisle
6. Maintain the order as shown in the directory (left to right, top to bottom)

**Return Format:**
Provide your response as a JSON object with this exact structure:

{
  "aisles": [
    {
      "name": "Aisle 1",
      "sections": ["Produce", "Organic Vegetables", "Herbs"]
    },
    {
      "name": "Aisle 2",
      "sections": ["Dairy", "Eggs", "Butter", "Cheese"]
    },
    {
      "name": "Perimeter",
      "sections": ["Deli", "Bakery", "Pharmacy"]
    }
  ]
}

**Important:**
- Include ALL aisles from the directory
- Each aisle must have a "name" (e.g., "Aisle 1", "A1", "Front")
- Each aisle must have a "sections" array (can be empty if no sections listed)
- Preserve original capitalization and naming
- Use complete, readable names (e.g., "Aisle 1" not "A1" unless that's exactly what's shown)

Analyze the image carefully and extract all store layout information.`;
