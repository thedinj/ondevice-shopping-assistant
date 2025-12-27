# LLM Shared Infrastructure

Reusable infrastructure for building LLM-powered features in the app.

## Overview

This module provides a modal-based system for running LLM API calls with support for:

-   Automatic OpenAI API integration using app settings
-   JSON-formatted responses
-   Text input and/or file attachments
-   Separate system prompts and user-facing instructions
-   Custom output rendering
-   Accept/Cancel workflow
-   Automatic API key validation and button disabling
-   Input validation (requires at least one input type)

## Components

### `LLMModal`

The main modal component that handles the entire LLM interaction flow. Automatically fetches the OpenAI API key from settings and creates the client internally.

**Features:**

-   Shows user-friendly instructions (not technical prompts)
-   Optional text input field
-   Optional file attachments (camera/file upload)
-   Validates at least one input type has content
-   Custom output rendering with Accept/Cancel buttons

### `LLMButton`

A themed button component with robot icon for triggering LLM features. **Automatically disabled when no API key is configured.**

**Props:**

-   `children`: Button text
-   `onClick`: Click handler
-   `disabled`: Whether button is disabled (in addition to automatic API key check)
-   `size`: Button size ("small" | "default" | "large")
-   `expand`: Button expand mode ("full" | "block")

**Example:**

```tsx
<LLMButton onClick={() => openModal(config)}>Generate Description</LLMButton>
```

## Hooks

### `useLLMModal()`

Access the LLM modal functionality.

**Returns:**

-   `openModal(config)`: Open the modal with configuration
-   `closeModal()`: Close the modal

## Types

### `LLMModalConfig<T>`

Configuration for opening the modal. The API key and client are handled automatically.

```typescript
interface LLMModalConfig<T = unknown> {
    // System prompt (technical instructions for the LLM, not shown to user)
    prompt: string;

    // User-facing instructions shown in the modal UI
    userInstructions?: string;

    // Model to use (default: "gpt-4o-mini", use "gpt-4o" for vision)
    model?: string;

    // Required renderer for displaying LLM output
    renderOutput: (response: LLMResponse<T>) => React.ReactNode;

    // Accept callback when user approves the result
    onAccept: (response: LLMResponse<T>) => void;

    // Enable/disable text input field (default: false)
    allowTextInput?: boolean;

    // Enable/disable file attachments (default: false)
    allowAttachments?: boolean;

    // Cancel callback (optional)
    onCancel?: () => void;

    // Modal title (default: "LLM Assistant")
    title?: string;
}
```

**Important:**

-   `prompt`: Technical system prompt sent to the LLM (not displayed to users)
-   `userInstructions`: Friendly instructions displayed in the modal UI
-   At least one of `allowTextInput` or `allowAttachments` must be true
-   Modal validates that at least one input type has content before running

### `LLMResponse<T>`

Standardized LLM response format.

```typescript
interface LLMResponse<T = unknown> {
    data: T; // Parsed JSON data
    raw: string; // Raw JSON string
}
```

### `LLMAttachment`

File attachment structure.

```typescript
interface LLMAttachment {
    name: string; // File name
    data: string | File; // Base64 string or File object
    mimeType: string; // MIME type
}
```

## Usage Examples

### Text-Only Input

```tsx
import { useLLMModal, LLMButton } from "@/llm/shared";

function MyComponent() {
    const { openModal } = useLLMModal();

    const handleGenerate = () => {
        openModal({
            title: "Generate Item",
            prompt: "Generate a grocery item with name, category, and price based on user description",
            userInstructions:
                "Describe the grocery item you'd like to generate",
            model: "gpt-4o-mini",
            allowTextInput: true, // Show text input
            allowAttachments: false, // Hide attachments
            renderOutput: (response) => (
                <div>
                    <h3>{response.data.name}</h3>
                    <p>Category: {response.data.category}</p>
                </div>
            ),
            onAccept: (response) => {
                console.log("User accepted:", response.data);
            },
        });
    };

    return <LLMButton onClick={handleGenerate}>Generate with AI</LLMButton>;
}
```

### Image-Only Input

```tsx
function ScanReceipt() {
    const { openModal } = useLLMModal();

    const handleScan = () => {
        openModal({
            title: "Scan Receipt",
            prompt: "Extract items from receipt image with quantities and prices",
            userInstructions: "Take a photo of your receipt or upload an image",
            model: "gpt-4o", // Vision model required for images
            allowTextInput: false, // Hide text input
            allowAttachments: true, // Show camera/file upload
            renderOutput: (response) => (
                <ul>
                    {response.data.items.map((item, i) => (
                        <li key={i}>
                            {item.name} - ${item.price}
                        </li>
                    ))}
                </ul>
            ),
            onAccept: (response) => {
                // Add items to shopping list
            },
        });
    };

    return <LLMButton onClick={handleScan}>Scan Receipt</LLMButton>;
}
```

### Combined Text and Image Input

```tsx
function RecipeIdeas() {
    const { openModal } = useLLMModal();

    const handleGetIdeas = () => {
        openModal({
            title: "Recipe Ideas",
            prompt: "Suggest recipes based on image and user preferences",
            userInstructions:
                "Upload a photo of your pantry and describe dietary preferences",
            model: "gpt-4o", // Vision model for images
            allowTextInput: true, // Show text input
            allowAttachments: true, // Show camera/file upload
            renderOutput: (response) => (
                <div>
                    {response.data.recipes.map((recipe, i) => (
                        <div key={i}>
                            <h3>{recipe.name}</h3>
                            <p>{recipe.ingredients.join(", ")}</p>
                        </div>
                    ))}
                </div>
            ),
            onAccept: (response) => {
                console.log("Recipes:", response.data.recipes);
            },
        });
    };

    return <LLMButton onClick={handleGetIdeas}>Get Recipe Ideas</LLMButton>;
}
```

## Setup

The infrastructure is already wired up in `App.tsx`:

```tsx
<LLMModalProvider>
    {/* Your app content */}
    <LLMModal />
</LLMModalProvider>
```

## API Key Configuration

The system automatically uses the OpenAI API key from app settings:

1. Users configure their API key in **Settings → OpenAI API Key**
2. The `LLMButton` automatically checks if an API key exists and disables itself if not
3. The `LLMModal` retrieves the key when running and creates an `OpenAIClient` internally
4. No need to pass API keys or clients in your component code

## File Attachments

### Native Platforms (Android/iOS)

-   Uses Capacitor Camera plugin (dynamically imported)
-   Opens device photo gallery
-   Converts images to base64

### Web Platform

-   Uses standard HTML file input
-   Supports multiple file selection
-   Accepts images by default

**Note:** The `@capacitor/camera` plugin is optional. On native platforms without the plugin installed, an error message will be shown when attempting to add attachments.

## Input Validation

The modal validates inputs before calling the LLM API:

-   At least one input type must be enabled (`allowTextInput` or `allowAttachments`)
-   If text input is provided, it must not be empty (after trimming whitespace)
-   If only attachments are allowed, at least one file must be attached
-   User sees an error toast if validation fails

## Architecture Notes

-   **Automatic API key management** - No need to pass API keys in component code
-   **Separate prompts** - System prompts for LLM, user instructions for UI
-   **Flexible input types** - Text, images, or both
-   **Input validation** - Ensures at least one input is provided
-   **Context-based state management** for modal control
-   **Built-in OpenAI client** with JSON mode support
-   **Type-safe responses** for structured data handling
-   **Platform-aware file handling** (Capacitor vs web)
-   **Loading states** with skeleton loaders during API calls
-   **Error handling** with toast notifications
-   **Automatic button disabling** when API key is missing
