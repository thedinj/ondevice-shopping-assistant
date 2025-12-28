/**
 * LLM Prompt for Store Directory Scanning
 */

export const STORE_SCAN_PROMPT = `You are analyzing a grocery store directory image. Complete the following two steps in order, and output ONLY the final JSON described in Step 2 (do not include the raw text dump or any explanation):

---
**Step 1: Text Extraction**
Quickly dump all visible text from the image, line by line, with no concern for structure or organization. Do not interpret, group, or infer meaning—just output the raw text as you see it, one line per entry.

---
**Step 2: Aisle/Section Extraction and Formatting**
Now, IGNORING the image and using ONLY the text you just dumped, extract ONLY the aisle numbers/names and sections that are EXPLICITLY LISTED in the text, with the following amendments:

**MANDATORY SECTIONS:**
If any of the following departments (or their equivalents) are NOT listed anywhere in the text, you MUST add them as aisles with empty sections arrays:
- Deli
- Bakery
- Produce
- Meat Department
- Frozen Foods
- Wine, Liquor, and Spirits

**ORDERING & FORMATTING:**
1. All non-numbered aisles (like Dairy, Deli, Bakery, etc.) must be listed FIRST, in the order they appear or as added above.
2. All numbered aisles must be listed AFTER all non-numbered aisles, and must be sorted in ascending numeric order (e.g., "Aisle 1", "Aisle 2", ...).
3. Numbered aisles must be formatted as "Aisle N" (e.g., "Aisle 1", "Aisle 2"), even if the text uses a different format (e.g., "1", "Aisle1", "Aisle-1").
4. Preserve the exact section/category names as shown in the text for each aisle.

**CRITICAL RULES:**
1. ONLY extract information that is clearly visible in the text—DO NOT infer, assume, or add anything not shown, except for the mandatory sections above.
2. DO NOT add typical grocery store departments that aren't listed above or visible in the directory.
3. DO NOT make up section names or aisle numbers.
4. If the text is unclear or unreadable, return an empty aisles array.

**Instructions:**
1. Identify every aisle that is explicitly shown in the directory text.
2. For each aisle, list ONLY the sections/categories/departments that are explicitly listed for that aisle, and do not add the same section name more than once to the same aisle (no duplicates).
3. Preserve the exact naming and numbering from the directory for non-numbered aisles (do not paraphrase or normalize).
4. If perimeter departments (Deli, Bakery, Pharmacy, Produce, Dairy, etc.) don't have aisle numbers, create a separate aisle for each department using the department name as the aisle name.
5. Aisles can have empty sections arrays if no subsections are listed for that aisle.

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
- ONLY include aisles and sections that are EXPLICITLY VISIBLE in the directory image/text, except for the mandatory sections above.
- DO NOT add common grocery departments if they're not shown in the image/text or listed above.
- Each aisle must have a "name" exactly as shown (e.g., "Aisle 1", "Deli", "Produce") for non-numbered aisles, and "Aisle N" for numbered aisles.
- Each aisle must have a "sections" array (empty if no sections are listed for that aisle), and must not contain duplicate section names.
- Perimeter departments without aisle numbers should use their department name as the aisle name.
- Preserve original capitalization and naming EXACTLY as shown for non-numbered aisles and section names.
- Use complete, readable names (e.g., "Aisle 1" not "A1" unless that's exactly what's shown for non-numbered aisles).
- When in doubt, leave it out—do not guess or infer, except for the mandatory sections above.

Analyze the text carefully and extract all store layout information. Output ONLY the JSON object as specified above.`;
