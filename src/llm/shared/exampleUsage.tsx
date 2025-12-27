/**
 * Example Usage of LLM Infrastructure
 *
 * This file demonstrates how to use the LLM modal system in your components.
 * The API key and client creation are handled automatically by the infrastructure.
 */

import { useCallback } from "react";
import { LLMButton, useLLMModal } from "./index";

interface GroceryItem {
    name: string;
    category: string;
    price: number;
}

interface ReceiptData {
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

interface RecipeIdeas {
    recipes: Array<{
        name: string;
        ingredients: string[];
        difficulty: string;
    }>;
}

/**
 * Example 1: Text-only LLM interaction
 */
export function ExampleTextOnly() {
    const { openModal } = useLLMModal();

    const handleGenerateItem = useCallback(() => {
        openModal<GroceryItem>({
            title: "Generate Item Details",
            prompt: "Generate a grocery item with name, category, and estimated price in JSON format based on user's description",
            userInstructions:
                "Describe the grocery item you'd like to generate (e.g., 'organic bananas')",
            model: "gpt-4o-mini",
            allowTextInput: true, // Show text input field
            allowAttachments: false, // Hide attachments
            renderOutput: (response) => (
                <div>
                    <h3>{response.data.name}</h3>
                    <p>Category: {response.data.category}</p>
                    <p>Price: ${response.data.price}</p>
                </div>
            ),
            onAccept: (response) => {
                console.log("Accepted:", response.data);
                // Save to database or update form
            },
            onCancel: () => {
                console.log("User cancelled");
            },
        });
    }, [openModal]);

    return <LLMButton onClick={handleGenerateItem}>Generate with AI</LLMButton>;
}

/**
 * Example 2: Image-only analysis (no text input)
 */
export function ExampleImageAnalysis() {
    const { openModal } = useLLMModal();

    const handleAnalyzeReceipt = useCallback(() => {
        openModal<ReceiptData>({
            title: "Analyze Receipt",
            prompt: "Analyze this receipt image and extract items with quantities and prices in JSON format",
            userInstructions: "Take a photo of your receipt or upload an image",
            model: "gpt-4o", // Use gpt-4o for vision
            allowAttachments: true, // Enable camera/file upload
            allowTextInput: false, // No text input needed
            renderOutput: (response) => (
                <ul>
                    {response.data.items.map((item, i) => (
                        <li key={i}>
                            {item.name} - {item.quantity} × ${item.price}
                        </li>
                    ))}
                </ul>
            ),
            onAccept: (response) => {
                // Add items to shopping list
                console.log("Receipt items:", response.data.items);
            },
        });
    }, [openModal]);

    return <LLMButton onClick={handleAnalyzeReceipt}>Scan Receipt</LLMButton>;
}

/**
 * Example 3: Combined text and image input
 */
export function ExampleCombinedInput() {
    const { openModal } = useLLMModal();

    const handleRecipeIdeas = useCallback(() => {
        openModal<RecipeIdeas>({
            title: "Recipe Ideas",
            prompt: "Based on the ingredients in the image and the user's preferences, suggest recipes in JSON format",
            userInstructions:
                "Upload a photo of your pantry/fridge and describe any dietary preferences or restrictions",
            model: "gpt-4o", // Vision model for images
            allowTextInput: true, // Allow text for preferences
            allowAttachments: true, // Allow images of ingredients
            renderOutput: (response) => (
                <div>
                    {response.data.recipes.map((recipe, i) => (
                        <div key={i}>
                            <h3>{recipe.name}</h3>
                            <p>Difficulty: {recipe.difficulty}</p>
                            <p>Ingredients: {recipe.ingredients.join(", ")}</p>
                        </div>
                    ))}
                </div>
            ),
            onAccept: (response) => {
                console.log("Accepted recipes:", response.data.recipes);
            },
        });
    }, [openModal]);

    return <LLMButton onClick={handleRecipeIdeas}>Get Recipe Ideas</LLMButton>;
}

/**
 * Notes:
 * - LLMButton automatically disables when no API key is configured
 * - Users configure API key in Settings
 * - System prompt (prompt field) is not shown to users
 * - User instructions (userInstructions field) are displayed in the modal
 * - allowTextInput: true shows a text input field
 * - allowAttachments: true shows camera/file upload options
 * - Modal validates that at least one input type has content before running
 */
