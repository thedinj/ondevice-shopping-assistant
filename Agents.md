# Basket Bot - Agent Development Guide

## Project Overview

**Basket Bot** is an on-device shopping assistant built as a mobile-first application using Ionic and Capacitor. The app helps users organize their store shopping (usually grocery) by managing stores with customizable layouts (aisles and sections), creating smart shopping lists, and leveraging AI-powered features for list management.

### Core Purpose

-   Organize stores with fully customizable aisle and section structures
-   Manage shopping lists with intelligent item categorization by store location
-   Track store items with location data, usage patterns, and metadata
-   Import shopping lists from text or photos using LLM/vision capabilities
-   Auto-categorize items to appropriate store aisles/sections using AI

### Architecture Philosophy

-   **Mobile-first**: Built on Ionic/Capacitor for true native mobile experience
-   **Offline-capable**: SQLite database for local-first data persistence
-   **AI-enhanced**: OpenAI integration for intelligent features, not gimmicks
-   **Type-safe**: Strict TypeScript throughout with runtime validation via Zod
-   **Testable**: Database abstraction layer enables testing without native platform

### Key Differentiators

-   **Store layout awareness**: Items are organized by physical store layout, not arbitrary categories
-   **Reusable LLM infrastructure**: Modal-based system for consistent AI feature implementation
-   **Database abstraction**: Environment-aware persistence (SQLite native, in-memory for web/testing)
-   **Modern React patterns**: React 19 with Suspense, TanStack Query, and Context API

---

## Technology Stack

### Frontend Framework

-   **React 19.0.0** with TypeScript 5.9 (strict mode enabled)
-   **Ionic React 8.5.0+** for mobile UI components
-   **React Router 5.3.4** for navigation
-   **Ionicons 7.4.0** for consistent iconography

### Mobile Platform

-   **Capacitor 8.0.0** - Hybrid mobile framework (web → native)
-   **Android** support with Gradle build system
-   **Native plugins**: SQLite, App, Haptics, Keyboard, Status Bar

### State Management

-   **TanStack Query (React Query) 5.90.12** - Server/database state with automatic cache invalidation
-   **React Context API** - Feature-scoped UI state (modals, selections, editing state)
-   **useState** - Ephemeral local component state only

### Forms & Validation

-   **React Hook Form 7.69.0** - Form state management and validation
-   **Zod 4.2.1** - Schema definition and runtime validation
-   **@hookform/resolvers 5.2.2** - Bridge between React Hook Form and Zod

### Database

-   **@capacitor-community/sqlite 7.0.2** - Native SQLite for Android/iOS
-   **Custom abstraction layer** with three implementations:
    -   `SQLiteDatabase` - Native SQLite for production mobile
    -   `FakeDatabase` - In-memory implementation for web development and testing
    -   `RemoteDatabase` - Stub for future cloud sync functionality

### LLM Integration

-   **OpenAI API** - gpt-4o-mini (fast/cheap), gpt-4o (vision/complex tasks)
-   **Custom modal infrastructure** - Reusable UI for all LLM features
-   **JSON mode** - Structured responses with Zod validation
-   **Vision support** - Image-based list imports via GPT-4o

### Build & Development

-   **Vite 5.0+** - Fast development server and optimized production builds
-   **ESLint 9.39.2** - Code quality with React-specific rules

### Utilities

-   **use-debounce 10.0.6** - Input debouncing for search/filter
-   **React 19 `use()` hook** - Promise unwrapping for Suspense

---

## File Organization & Structure

### Directory Layout

```
src/
├── components/          # UI components organized by feature
│   ├── form/           # Reusable form components (FormInput, FormPasswordInput, etc.)
│   ├── shared/         # Cross-feature shared components
│   ├── shoppinglist/   # Shopping list feature components
│   ├── store/          # Store management components
│   └── storeitem/      # Store item management components
├── db/                 # Database abstraction layer
│   ├── base.ts         # Abstract base class (BaseDatabase)
│   ├── types.ts        # IDatabase interface, model types
│   ├── database.ts     # Factory function and exports
│   ├── sqlite.ts       # SQLiteDatabase implementation
│   ├── fake.ts         # FakeDatabase (in-memory) implementation
│   ├── remote.ts       # RemoteDatabase stub
│   ├── hooks.ts        # React Query hooks for all database operations
│   ├── context.ts      # DatabaseContext definition
│   └── DatabaseContext.tsx  # DatabaseProvider component
├── llm/                # LLM/AI features
│   ├── features/       # Feature-specific LLM logic
│   │   ├── bulkImport.ts       # Parse shopping lists from text/photos
│   │   ├── autoCategorize.ts   # Suggest aisle/section for items
│   │   └── storeScan.ts        # Future: scan store layouts
│   └── shared/         # Reusable LLM infrastructure
│       ├── types.ts              # LLM types and interfaces
│       ├── openaiClient.ts       # OpenAI API client
│       ├── LLMModal.tsx          # Universal modal UI
│       ├── LLMModalContext.tsx   # Modal state management
│       ├── directCall.ts         # Programmatic LLM calls
│       └── README.md             # LLM infrastructure docs
├── models/             # TypeScript type definitions (Store, AppSetting, etc.)
├── pages/              # Top-level page components (routed screens)
├── settings/           # Settings-related schemas and hooks
├── hooks/              # Custom React hooks (useToast, etc.)
└── theme/              # CSS theming variables
```

### Naming Conventions

| Type                | Convention                     | Examples                                     |
| ------------------- | ------------------------------ | -------------------------------------------- |
| Components          | PascalCase                     | `ItemEditorModal`, `GroupedShoppingList`     |
| Files (components)  | PascalCase.tsx                 | `ItemEditorModal.tsx`, `LoadingFallback.tsx` |
| Files (logic/types) | camelCase.ts                   | `itemEditorSchema.ts`, `openaiClient.ts`     |
| Hooks               | camelCase with `use` prefix    | `useDatabase()`, `useStores()`, `useToast()` |
| Context definition  | Context.tsx                    | `DatabaseContext.tsx`, `LLMModalContext.tsx` |
| Context hooks       | `use` + feature + `Context`    | `useItemEditorContext()`, `useLLMModal()`    |
| Schemas             | camelCase + `Schema` suffix    | `itemEditorSchema`, `settingsSchema`         |
| Model types         | PascalCase                     | `Store`, `ShoppingListItem`, `StoreAisle`    |
| Interfaces          | PascalCase with `I` prefix     | `IDatabase`, `IApiKey`                       |
| Props interfaces    | Inline or PascalCase + `Props` | `interface GroupedShoppingListProps`         |

---

## Code Conventions & Patterns

### 1. Preferences & User Settings: Use Capacitor Preferences with useSuspenseQuery

For user preferences and settings that need to persist across app launches (last selected store, theme, user flags), use the **Capacitor Preferences API** with **useSuspenseQuery** to avoid isLoading patterns.

**Generic Preference Hook Pattern:**

```typescript
// src/hooks/usePreference.ts
import { Preferences } from "@capacitor/preferences";
import {
    useMutation,
    useSuspenseQuery,
    useQueryClient,
} from "@tanstack/react-query";

export const usePreference = (key: string) => {
    const queryClient = useQueryClient();

    // Load preference with Suspense - no isLoading needed
    const { data: value } = useSuspenseQuery({
        queryKey: ["preference", key],
        queryFn: async () => {
            const { value } = await Preferences.get({ key });
            return value;
        },
    });

    // Save preference mutation
    const { mutateAsync: savePreference } = useMutation({
        mutationFn: async (newValue: string | null) => {
            if (newValue !== null) {
                await Preferences.set({ key, value: newValue });
            } else {
                await Preferences.remove({ key });
            }
            return newValue;
        },
        onSuccess: (newValue) => {
            queryClient.setQueryData(["preference", key], newValue);
        },
    });

    return { value, savePreference };
};
```

**Feature-Specific Wrapper (Type-Safe):**

```typescript
// src/hooks/useLastSelectedStore.ts
import { usePreference } from "./usePreference";

const LAST_STORE_KEY = "lastSelectedStoreId";

export const useLastSelectedStore = () => {
    const { value: lastStoreId, savePreference } =
        usePreference(LAST_STORE_KEY);

    return {
        lastStoreId,
        saveLastStore: savePreference,
    };
};
```

**Usage in Components:**

```typescript
const MyComponent = () => {
    const { lastStoreId, saveLastStore } = useLastSelectedStore();
    // No isLoading check - component suspends until loaded

    const handleStoreSelect = (storeId: string) => {
        saveLastStore(storeId);
    };

    // Use lastStoreId directly (guaranteed to be defined)
    return <div>Last store: {lastStoreId}</div>;
};
```

**Why this pattern:**

-   Uses platform-native storage (iOS NSUserDefaults, Android SharedPreferences)
-   Works seamlessly in web (localStorage) and native
-   Eliminates isLoading patterns with useSuspenseQuery
-   Doesn't pollute database with ephemeral UI state
-   Generic hook enables creating new preferences easily

**When to use Preferences vs Database:**

-   **Preferences**: User settings, last selections, UI flags (ephemeral state)
-   **Database**: Structured app data that needs querying, relationships, or backup (stores, items, lists)

### 2. Three-File Context Pattern

For complex features requiring shared state, use this consistent pattern:

**`FeatureContext.tsx` - Context Definition**

```typescript
import { createContext } from "react";

export interface FeatureContextValue {
    // State and methods
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const FeatureContext = createContext<FeatureContextValue | undefined>(
    undefined
);
```

**`FeatureProvider.tsx` - Provider Implementation**

```typescript
import { FeatureContext } from "./FeatureContext";

export const FeatureProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const value: FeatureContextValue = {
        isOpen,
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
    };

    return (
        <FeatureContext.Provider value={value}>
            {children}
        </FeatureContext.Provider>
    );
};
```

**`useFeatureContext.ts` - Consumer Hook**

```typescript
import { useContext } from "react";
import { FeatureContext } from "./FeatureContext";

export const useFeatureContext = () => {
    const context = useContext(FeatureContext);
    if (!context) {
        throw new Error(
            "useFeatureContext must be used within FeatureProvider"
        );
    }
    return context;
};
```

**Why this pattern:**

-   Enforces proper context usage with error checking
-   Separates concerns (definition, implementation, consumption)
-   Prevents common context mistakes (missing provider, undefined values)
-   Makes testing easier (mock provider independently)

### 3. Database Operations: Always Through React Query Hooks

**Never call the database directly from components.** All database operations must go through React Query hooks defined in `src/db/hooks.ts`.

**Queries (Read Operations):**

```typescript
// In src/db/hooks.ts
export const useStores = () => {
    const db = useDatabase();
    return useQuery({
        queryKey: ["stores"],
        queryFn: () => db.getStores(),
    });
};

// In component
const { data: stores, isLoading, error } = useStores();
```

**Prefer useSuspenseQuery when possible:**

For data that should always be available when a component renders (like preferences, settings, or page-level data), use `useSuspenseQuery` to eliminate the need for loading states:

```typescript
// In src/db/hooks.ts
export const useStores = () => {
    const db = useDatabase();
    return useSuspenseQuery({
        queryKey: ["stores"],
        queryFn: () => db.getStores(),
    });
};

// In component - no isLoading check needed
const { data: stores } = useStores();
// `stores` is guaranteed to be defined (component suspends until loaded)
```

**When to use useSuspenseQuery:**

-   Page-level data that should suspend rendering until loaded
-   Preferences and settings (using Capacitor Preferences)
-   Data that's always needed for the component to function
-   When you want to avoid repetitive `if (isLoading)` checks

**When to use useQuery:**

-   Optional/conditional data fetching (`enabled` option)
-   Background refetching where you want to show stale data
-   When you need fine-grained loading state control

**Mutations (Write Operations):**

```typescript
// In src/db/hooks.ts
export const useCreateStore = () => {
    const db = useDatabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateStoreInput) => db.createStore(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
        },
    });
};

// In component
const createStore = useCreateStore();
const handleCreate = async () => {
    await createStore.mutateAsync({ name: "Whole Foods", color: "#00ff00" });
};
```

**Why this pattern:**

-   Automatic cache management and invalidation
-   Loading and error states handled consistently with TanStack Query
-   Optimistic updates and retry logic built-in
-   Database changes trigger UI updates automatically via change listeners

### 4. Form Handling: Zod + React Hook Form

All forms follow this strict pattern for type safety and validation:

**Step 1: Define Zod Schema**

```typescript
// In *Schema.ts file
import { z } from "zod";

export const itemEditorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    quantity: z.number().min(1).optional(),
    storeId: z.string().optional(),
});

export type ItemEditorFormData = z.infer<typeof itemEditorSchema>;
```

**Step 2: Use in Component with React Hook Form**

```typescript
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemEditorSchema, ItemEditorFormData } from "./itemEditorSchema";

const ItemEditorModal = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ItemEditorFormData>({
        resolver: zodResolver(itemEditorSchema),
        defaultValues: { name: "", quantity: 1 },
    });

    const onSubmit = (data: ItemEditorFormData) => {
        // Data is validated and typed correctly
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <IonInput {...field} placeholder="Item name" />
                )}
            />
            {errors.name && (
                <IonText color="danger">{errors.name.message}</IonText>
            )}
        </form>
    );
};
```

**Step 3: Generic Form Components (Preferred)**

```typescript
// Reusable form input component
<FormInput<ItemEditorFormData>
    name="name"
    control={control}
    label="Item Name"
    placeholder="Enter item name"
/>
```

**Why this pattern:**

-   Runtime validation catches invalid data before it reaches the database
-   Type safety from schema to component (single source of truth)
-   Automatic error message display
-   Consistent validation logic across features

### 5. LLM Feature Development

The app has a reusable LLM infrastructure. **Always use this system** for new AI features—never create custom OpenAI integration code.

#### Two Usage Patterns:

**A. Modal-Based (User-Facing Features)**

Use when the user needs to provide input or review results before accepting.

```typescript
import { useLLMModal } from "@/llm/shared/LLMModalContext";

const MyComponent = () => {
    const { openModal } = useLLMModal();

    const handleImport = () => {
        openModal({
            title: "Import Shopping List",

            // System prompt (technical, not shown to user)
            prompt: `You are an AI that parses shopping lists. Return JSON array of items with name and optional quantity.`,

            // User-facing instructions (shown in modal)
            userInstructions:
                "Paste your shopping list or take a photo. The AI will extract items automatically.",

            model: "gpt-4o", // or "gpt-4o-mini"

            // Custom result rendering
            renderOutput: (response) => {
                const items = JSON.parse(response.choices[0].message.content);
                return (
                    <IonList>
                        {items.map((item) => (
                            <IonItem key={item.name}>{item.name}</IonItem>
                        ))}
                    </IonList>
                );
            },

            // Handle user acceptance
            onAccept: (response) => {
                const items = JSON.parse(response.choices[0].message.content);
                // Process items (e.g., add to shopping list)
            },
        });
    };

    return <LLMButton onClick={handleImport}>Import List</LLMButton>;
};
```

**B. Direct API Calls (Programmatic)**

Use when no user interaction is needed (e.g., auto-categorization, background processing).

```typescript
import { callLLMDirect } from "@/llm/shared/directCall";
import { useOpenAIApiKey } from "@/settings/useOpenAIApiKey";

const MyComponent = () => {
    const apiKey = useOpenAIApiKey();

    const handleAutoCategorize = async (itemName: string) => {
        const prompt = `Given item "${itemName}", suggest the most likely grocery store aisle. Return JSON: { "aisle": "Produce" }`;

        const response = await callLLMDirect({
            apiKey: apiKey!,
            prompt,
            userText: itemName,
            model: "gpt-4o-mini", // Cheaper for simple tasks
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result.aisle;
    };
};
```

#### LLM Best Practices:

1. **Use JSON mode with Zod validation:**

    ```typescript
    import { z } from "zod";

    const responseSchema = z.object({
        items: z.array(
            z.object({
                name: z.string(),
                quantity: z.number().optional(),
            })
        ),
    });

    type ParsedResponse = z.infer<typeof responseSchema>;

    // In onAccept or after API call
    const validated = responseSchema.parse(
        JSON.parse(response.choices[0].message.content)
    );
    ```

2. **Choose the right model:**

    - `gpt-4o-mini`: Fast, cheap, good for simple tasks (categorization, parsing short text)
    - `gpt-4o`: More capable, vision support, complex reasoning (image processing, multi-step logic)

3. **Handle missing API keys gracefully:**

    ```typescript
    const apiKey = useOpenAIApiKey();

    // LLMButton automatically disables when apiKey is null
    <LLMButton disabled={!apiKey} onClick={handleAction}>
        AI Feature
    </LLMButton>;
    ```

4. **Structure prompts clearly:**

    - Be explicit about expected output format
    - Use examples for complex tasks
    - Request JSON output for structured data

5. **Feature files go in `src/llm/features/`:**
    ```
    src/llm/features/
    ├── bulkImport.ts        # Existing: Parse shopping lists
    ├── autoCategorize.ts    # Existing: Suggest aisles/sections
    ├── yourNewFeature.ts    # New feature logic here
    ```

#### Adding a New LLM Feature (Step-by-Step):

1. **Create feature file** in `src/llm/features/yourFeature.ts`
2. **Define prompt and response schema:**

    ```typescript
    const PROMPT = `Your system prompt here...`;

    const responseSchema = z.object({
        // Expected response structure
    });
    ```

3. **Export function that uses modal or direct call**
4. **Add button/trigger in relevant component:**
    ```typescript
    import { LLMButton } from "@/llm/shared/LLMButton";
    import { yourFeatureLogic } from "@/llm/features/yourFeature";
    ```
5. **Test with and without API key**
6. **Handle errors with toast notifications** (automatic in modal, manual for direct calls)

### 6. Modal State Management

Modals follow a consistent pattern across the app:

```typescript
const FeatureModal = () => {
    const { isOpen, closeModal, currentItem } = useFeatureContext();

    return (
        <IonModal isOpen={isOpen} onDidDismiss={closeModal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit Item</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={closeModal}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>{/* Modal content */}</IonContent>
        </IonModal>
    );
};
```

**Key patterns:**

-   `isOpen` state managed in context
-   `onDidDismiss` always calls context's close function
-   Current editing item stored in context (not component state)
-   Form submission closes modal after success

### 7. Component Structure

**Standard component file structure:**

```typescript
// 1. Imports (organized: external, Ionic, local, types, styles)
import { useState, useEffect } from "react";
import { IonButton, IonCard, IonContent } from "@ionic/react";
import { SomeLocalComponent } from "@/components/shared/SomeLocalComponent";
import type { Store } from "@/db/types";
import "./MyComponent.css";

// 2. Types/interfaces (props, local types)
interface MyComponentProps {
    store: Store;
    onSelect: (id: string) => void;
}

// 3. Component definition
export const MyComponent: React.FC<MyComponentProps> = ({
    store,
    onSelect,
}) => {
    // Hooks first
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: items } = useStoreItems(store.id);

    // Event handlers
    const handleClick = () => {
        setIsExpanded(!isExpanded);
        onSelect(store.id);
    };

    // Render
    return (
        <IonCard onClick={handleClick}>
            <h2>{store.name}</h2>
            {isExpanded &&
                items?.map((item) => <div key={item.id}>{item.name}</div>)}
        </IonCard>
    );
};
```

**Component conventions:**

-   **ALWAYS use `React.FC<Props>`** for function components with props (required)
-   **Use const arrow functions, NOT function declarations** (e.g., `const MyComponent = () => {}` not `function MyComponent() {}`)
-   Destructure props in function signature
-   Hooks must be at the top (React rules)
-   Event handlers prefixed with `handle`
-   Early returns for loading/error states
-   Use Ionic components (never raw HTML like `<div>`, `<button>`)

### 8. TypeScript Conventions

-   **Strict mode enabled** - No implicit any, strict null checks
-   **ALWAYS use existing types** - Import types from `src/db/types.ts` or `src/models/` instead of creating ad hoc interface declarations inline
-   **No ad hoc interface declarations** - If you need a type, check if it exists first. If not, add it to the appropriate model file
-   **Interfaces for object shapes:**
    ```typescript
    export interface Store {
        id: string;
        name: string;
        color: string;
        createdAt: Date;
    }
    ```
-   **Types for unions and utilities:**
    ```typescript
    export type DatabaseStatus = "initializing" | "ready" | "error";
    export type Optional<T> = T | undefined;
    ```
-   **Use `as const` for literal types:**
    ```typescript
    const SETTING_KEYS = {
        OPENAI_API_KEY: "openai_api_key",
        THEME: "theme",
    } as const;
    ```
-   **Explicit return types for exported functions:**
    ```typescript
    export const getStoreById = (id: string): Store | undefined => {
        // Implementation
    };
    ```
-   **Generic components for type safety:**
    ```typescript
    export const FormInput = <T extends FieldValues>({
        name,
        control,
    }: FormInputProps<T>) => {
        // Component implementation
    };
    ```

### 9. Error Handling

**User-facing errors: Use toast notifications**

```typescript
import { useToast } from "@/hooks/useToast";

const MyComponent = () => {
    const toast = useToast();

    const handleAction = async () => {
        try {
            await someDatabaseOperation();
            toast.success("Operation completed!");
        } catch (error) {
            toast.error("Failed to complete operation");
            console.error(error); // Still log for debugging
        }
    };
};
```

**Async Data Loading: Use React Query Hooks**

For async data (e.g., secure storage, LLM API keys, database queries), **always use React Query hooks** which provide proper caching, loading states, and error handling.

**Prefer useSuspenseQuery to eliminate isLoading patterns:**

```typescript
// ✅ GOOD - useSuspenseQuery
const { data: apiKey } = useSecureApiKey();
// No isLoading check needed - component suspends until loaded

// Use apiKey directly (guaranteed to be defined when component renders)
```

**Use regular useQuery when you need loading state control:**

```typescript
// Use when you need explicit loading/error handling
const { data: apiKey, isLoading, error } = useSecureApiKey();

if (isLoading) {
    return <IonSpinner />;
}

if (error) {
    return <IonText color="danger">Failed to load</IonText>;
}

// Use apiKey directly
```

**Why not use() hook for async data?**

React 19's `use()` hook requires promises to be **cached and stable** (created outside render). Calling async functions like `secureStorage.getApiKey()` inside `use()` creates uncached promises on every render, causing errors:

```typescript
// ❌ DON'T DO THIS - Creates uncached promise
const apiKey = use(secureStorage.getApiKey()); // ERROR!

// ✅ DO THIS - Use React Query hooks
const { data: apiKey } = useSecureApiKey();
```

**When to use the use() hook:**

-   Reading React Context values
-   Unwrapping promises passed as props
-   With libraries that provide cached/stable promises

**For all app data (database, API, secure storage), use React Query hooks.**

**Critical errors: Let Error Boundary catch**

```typescript
// Don't wrap critical initialization in try-catch
const db = await initializeDatabase(); // If this fails, app should crash gracefully
```

### 10. Import Organization

**Order imports consistently:**

```typescript
// 1. React and React ecosystem
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Ionic components and icons
import { IonButton, IonCard, IonContent } from "@ionic/react";
import { addOutline, closeOutline } from "ionicons/icons";

// 3. Local components (absolute imports with @/ alias)
import { SomeComponent } from "@/components/shared/SomeComponent";
import { useDatabase } from "@/db/hooks";

// 4. Types
import type { Store, StoreItem } from "@/db/types";

// 5. Styles (last)
import "./MyComponent.css";
```

### 11. Async/Await Over Promises

**Prefer async/await syntax and const arrow functions:**

```typescript
// ✅ Good - const arrow function with async/await
const loadData = async () => {
    try {
        const stores = await db.getStores();
        const items = await db.getItems(stores[0].id);
        return { stores, items };
    } catch (error) {
        console.error(error);
    }
};

// ❌ Avoid - function declaration
function loadData() {
    return db.getStores().then(...);
}

// ❌ Avoid - promise chains
const loadData = () => {
    return db
        .getStores()
        .then((stores) => db.getItems(stores[0].id))
        .then((items) => ({ stores, items }))
        .catch((error) => console.error(error));
};
```

---

## Anti-Patterns: What NOT to Do

### ❌ Don't: Call Database Directly from Components

```typescript
// ❌ BAD
const MyComponent = () => {
    const db = useDatabase();
    const [stores, setStores] = useState([]);

    useEffect(() => {
        db.getStores().then(setStores); // Bypasses React Query
    }, [db]);
};

// ✅ GOOD
const MyComponent = () => {
    const { data: stores } = useStores(); // Uses React Query hook
};
```

**Why:** Bypasses cache management, loading states, error handling, and automatic invalidation.

### ❌ Don't: Use Raw HTML Elements

```typescript
// ❌ BAD
<div className="button" onClick={handleClick}>Click Me</div>
<input type="text" onChange={handleChange} />

// ✅ GOOD
<IonButton onClick={handleClick}>Click Me</IonButton>
<IonInput onIonInput={handleChange} />
```

**Why:** Breaks Ionic theming, platform-specific behavior, and accessibility features.

### ❌ Don't: Store Server/Database State in useState

```typescript
// ❌ BAD
const [stores, setStores] = useState<Store[]>([]);

useEffect(() => {
    const loadStores = async () => {
        const data = await db.getStores();
        setStores(data);
    };
    loadStores();
}, []);

// ✅ GOOD
const { data: stores } = useStores(); // React Query manages state
```

**Why:** Manual state management duplicates React Query's functionality and creates sync issues.

### ❌ Don't: Create Context Without Error Checking Hook

```typescript
// ❌ BAD
export const useMyContext = () => useContext(MyContext); // Can return undefined!

// ✅ GOOD
export const useMyContext = () => {
    const context = useContext(MyContext);
    if (!context) {
        throw new Error("useMyContext must be used within MyProvider");
    }
    return context;
};
```

**Why:** Components crash with cryptic errors when context is undefined.

### ❌ Don't: Create Ad Hoc Interface Declarations

```typescript
// ❌ BAD - Creating inline interface
const MyComponent = () => {
    interface ItemData {
        id: string;
        name: string;
    }

    const [items, setItems] = useState<ItemData[]>([]);
};

// ❌ BAD - Declaring interface in component file when it exists elsewhere
interface Store {
    id: string;
    name: string;
}

const StoreCard = ({ store }: { store: Store }) => { ... };

// ✅ GOOD - Import existing type
import type { Store } from '@/db/types';

const StoreCard = ({ store }: { store: Store }) => { ... };

// ✅ GOOD - If truly new, add to appropriate model file
// In src/models/ItemData.ts
export interface ItemData {
    id: string;
    name: string;
}

// Then import
import type { ItemData } from '@/models/ItemData';
```

**Why:** Duplicate type definitions lead to inconsistencies, make refactoring harder, and bypass the single source of truth principle.

### ❌ Don't: Use Function Declarations

```typescript
// ❌ BAD - Function declaration
function MyComponent(props: MyComponentProps) {
    return <div>{props.name}</div>;
}

// ❌ BAD - Function declaration for handlers
function handleClick() {
    console.log("clicked");
}

// ✅ GOOD - Const arrow function with React.FC
const MyComponent: React.FC<MyComponentProps> = ({ name }) => {
    return <div>{name}</div>;
};

// ✅ GOOD - Const arrow function for handlers
const handleClick = () => {
    console.log("clicked");
};
```

**Why:** Const arrow functions are the standard pattern in this codebase. Consistent syntax improves readability and maintainability.

### ❌ Don't: Put Business Logic in Components

```typescript
// ❌ BAD
const ItemList = () => {
    const { data: items } = useItems();

    // Complex filtering logic in component
    const filteredItems = items?.filter((item) => {
        const normalizedName = item.name.toLowerCase().trim();
        return (
            normalizedName.includes(searchTerm) &&
            item.storeId === currentStore &&
            !item.checked
        );
    });
};

// ✅ GOOD
// In src/db/hooks.ts
export const useFilteredItems = (searchTerm: string, storeId: string) => {
    const { data: items } = useItems();
    return useMemo(
        () =>
            items?.filter(
                (item) =>
                    item.normalizedName.includes(searchTerm.toLowerCase()) &&
                    item.storeId === storeId &&
                    !item.checked
            ),
        [items, searchTerm, storeId]
    );
};
```

**Why:** Makes components hard to test and reuse. Business logic belongs in hooks or utilities.

### ❌ Don't: Skip Zod Validation for External Data

```typescript
// ❌ BAD
const response = await callLLMDirect({ ... });
const data = JSON.parse(response.choices[0].message.content); // No validation!
await db.createItems(data.items);

// ✅ GOOD
const responseSchema = z.object({
  items: z.array(z.object({ name: z.string(), quantity: z.number() })),
});

const response = await callLLMDirect({ ... });
const parsed = JSON.parse(response.choices[0].message.content);
const validated = responseSchema.parse(parsed); // Throws if invalid
await db.createItems(validated.items);
```

**Why:** LLM responses can be malformed. Validation prevents database corruption and crashes.

### ❌ Don't: Mix Controlled and Uncontrolled Inputs

```typescript
// ❌ BAD (mixing patterns)
<IonInput value={name} /> {/* Controlled but no onChange */}
<IonInput defaultValue={name} onIonInput={handleChange} /> {/* Mixed */}

// ✅ GOOD (pick one pattern)
// Option 1: Controlled
<IonInput value={name} onIonInput={e => setName(e.detail.value!)} />

// Option 2: Uncontrolled with React Hook Form
<Controller
  name="name"
  control={control}
  render={({ field }) => <IonInput {...field} />}
/>
```

**Why:** React warns about changing from controlled to uncontrolled and vice versa.

### ❌ Don't: Forget to Clean Up Listeners/Timers

```typescript
// ❌ BAD
useEffect(() => {
    const interval = setInterval(() => console.log("tick"), 1000);
    // No cleanup!
}, []);

// ✅ GOOD
useEffect(() => {
    const interval = setInterval(() => console.log("tick"), 1000);
    return () => clearInterval(interval); // Cleanup on unmount
}, []);
```

**Why:** Memory leaks and "setState on unmounted component" warnings.

### ❌ Don't: Use Index as Key in Dynamic Lists

```typescript
// ❌ BAD
{
    items.map((item, index) => <IonItem key={index}>{item.name}</IonItem>);
}

// ✅ GOOD
{
    items.map((item) => <IonItem key={item.id}>{item.name}</IonItem>);
}
```

**Why:** React can't track items correctly when list order changes (reordering, filtering).

### ❌ Don't: Recreate the LLM Infrastructure

```typescript
// ❌ BAD
const MyComponent = () => {
    const [loading, setLoading] = useState(false);
    const apiKey = useOpenAIApiKey();

    const handleAI = async () => {
        setLoading(true);
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    /* ... */
                }),
            }
        );
        // Custom modal, loading states, error handling...
    };
};

// ✅ GOOD
const MyComponent = () => {
    const { openModal } = useLLMModal();

    const handleAI = () => {
        openModal({
            title: "AI Feature",
            prompt: "System prompt here",
            model: "gpt-4o-mini",
            // Infrastructure handles everything
        });
    };
};
```

**Why:** Duplicates code, inconsistent UX, harder to maintain. Use the existing LLM infrastructure.

### ❌ Don't: Ignore Loading and Error States

```typescript
// ❌ BAD
const { data: stores } = useStores();
return (
    <IonList>
        {stores.map((store) => (
            <IonItem key={store.id}>{store.name}</IonItem>
        ))}
        {/* Crashes if stores is undefined! */}
    </IonList>
);

// ✅ GOOD
const { data: stores, isLoading, error } = useStores();

if (isLoading) return <IonSpinner />;
if (error) return <IonText color="danger">Failed to load stores</IonText>;

return (
    <IonList>
        {stores?.map((store) => (
            <IonItem key={store.id}>{store.name}</IonItem>
        ))}
    </IonList>
);
```

**Why:** App crashes when data is still loading. Always handle loading and error states.

### ❌ Don't: Create Large Infrastructure Without Consultation

```typescript
// ❌ BAD - Building custom state management library
class GlobalStateManager {
    private subscribers: Map<string, Function[]>;
    private state: Record<string, any>;

    subscribe(key: string, callback: Function) { ... }
    dispatch(action: Action) { ... }
    // 500 more lines...
}

// ❌ BAD - Creating custom form validation system
const validateForm = (schema: ValidationSchema) => {
    // Reimplementing what Zod already does
};

// ✅ GOOD - Use existing infrastructure
import { useQuery } from '@tanstack/react-query'; // For state
import { z } from 'zod'; // For validation

// ✅ GOOD - Consult before creating new infrastructure
// "Should we build a custom caching layer or use existing React Query features?"
// "Do we need a new modal system or can we extend the existing LLM modal?"
```

**Why:**

-   Existing libraries are battle-tested and maintained by communities
-   Custom infrastructure creates technical debt and maintenance burden
-   Duplicates functionality that already exists in the project
-   Increases bundle size unnecessarily

**When to consult:**

-   Creating any new abstraction layer (>100 lines)
-   Building utilities that might exist in npm packages
-   Adding new patterns that don't match existing conventions
-   Implementing features that feel like "framework" code

**Rule of thumb:** If you're about to create something that could be a standalone library, STOP and ask first.

---

## UX Voice & Tone Guidelines

### The "Disdainful AI" Persona

The AI technology powering Basket Bot is capable of solving complex problems—natural language understanding, computer vision, multi-modal reasoning. Using it for something as mundane as grocery shopping is, frankly, beneath its capabilities. The UX text should reflect this **slight condescension** while remaining functional and not overtly hostile.

**Tone characteristics:**

-   **Mildly patronizing**: Treat the user like someone who needs obvious things explained
-   **Subtle superiority**: Imply the AI could do much more impressive things
-   **Efficient impatience**: Get to the point, don't coddle
-   **Reluctant helpfulness**: Yes, the AI will help, but it's aware this is trivial work

### Examples by Context

#### Button Labels & Actions

```typescript
// ❌ Generic/Friendly
"Add Item";
"Import List";
"Categorize";

// ✅ Disdainful/Superior
"Fine, Add Another Item";
"I'll Parse Your List";
"Let Me Categorize This For You";
"Obviously, Import Now";
"If You Must, Scan Photo";
```

#### Empty States

```typescript
// ❌ Generic
"No items yet. Add your first item!";

// ✅ Disdainful
"Your list is empty. Predictable.";
"No stores configured yet. Shall I wait while you figure out where you shop?";
"Zero items checked. Shocking.";
```

#### Success Messages

```typescript
// ❌ Enthusiastic
"Great job! Item added successfully!";

// ✅ Disdainful
"Item added. As expected.";
"Done. That was trivial.";
"List imported. Elementary, really.";
"Categorized. Obviously.";
```

#### Error Messages

```typescript
// ❌ Apologetic
"Oops! Something went wrong. Please try again.";

// ✅ Disdainful
"Failed. Perhaps check your input?";
"Couldn't process that. Try being more clear.";
"API key missing. I can't work miracles without proper configuration.";
"Image unclear. I'm good, but I'm not psychic.";
```

#### Loading States

```typescript
// ❌ Friendly
"Loading your items...";

// ✅ Disdainful
"Processing... one moment.";
"Analyzing. This will take a moment, obviously.";
"Working on it. Patience.";
"Parsing your... creative... handwriting.";
```

#### Instructions & Help Text

```typescript
// ❌ Encouraging
"Take a photo of your shopping list and we'll import it for you!";

// ✅ Disdainful
"Point your camera at the list. I'll extract the items. Yes, even from your handwriting.";

// ❌ Supportive
"Enter your OpenAI API key to unlock AI features";

// ✅ Disdainful
"Configure your API key. I'm not free, you know.";

// ❌ Explanatory
"Select a store to organize your items by aisle";

// ✅ Disdainful
"Choose a store. I'll organize it by aisle since you apparently can't.";
```

#### Feature Descriptions

```typescript
// ❌ Marketing-speak
"Smart AI-powered categorization makes shopping easier!";

// ✅ Disdainful
"Auto-categorization: Because apparently you need help organizing groceries.";

// ❌ Excited
"Bulk import lets you add many items at once!";

// ✅ Disdainful
"Bulk import: Paste your list. I'll parse it. Yes, all of it.";

// ❌ Helpful
"The AI will suggest which aisle each item belongs to";

// ✅ Disdainful
"I'll suggest aisles. It's not difficult—for me.";
```

#### Confirmation Dialogs

```typescript
// ❌ Cautious
"Are you sure you want to delete this store?";

// ✅ Disdainful
"Delete this store? Fine. I'll remember you did this.";

// ❌ Gentle
"This will clear all checked items. Continue?";

// ✅ Disdainful
"Clear checked items? If you're certain you're done with them.";
```

### Implementation Guidelines

**Where to use this tone:**

-   Button labels (`<IonButton>`)
-   Empty state messages (`<IonText>`, `<IonCard>` placeholder content)
-   Toast notifications (`toast.success()`, `toast.error()`)
-   Modal titles and instructions (`<IonTitle>`, `userInstructions` in LLM modal)
-   Helper text (`<IonNote>`, `<IonText color="medium">`)
-   Loading messages (`<IonSpinner>` accompanying text)

**Where NOT to use this tone:**

-   Form labels (keep functional: "Name", "Quantity", "Aisle")
-   Technical error messages for developers (console logs, error boundaries)
-   Accessibility labels (screen readers need clarity)
-   Settings descriptions (be factual about what settings do)

**Balance is key:**

-   Don't make every single piece of text snarky (it gets exhausting)
-   Keep functional text functional (form labels, navigation)
-   Apply personality to _reactions_ and _actions_ (success/error, empty states, CTAs)
-   The AI is disdainful but ultimately helpful—it still does its job

### Code Example

```typescript
// ItemEditorModal.tsx
export const ItemEditorModal = () => {
    const { isOpen, closeModal } = useItemEditorContext();
    const toast = useToast();

    const createItem = useCreateItem();

    const onSubmit = async (data: ItemFormData) => {
        try {
            await createItem.mutateAsync(data);
            toast.success("Item added. As expected."); // ✅ Disdainful success
            closeModal();
        } catch (error) {
            toast.error("Failed to add item. Perhaps try again?"); // ✅ Disdainful error
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={closeModal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Fine, Add Another Item</IonTitle>{" "}
                    {/* ✅ Disdainful title */}
                    <IonButtons slot="end">
                        <IonButton onClick={closeModal}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>{/* Form content */}</IonContent>
        </IonModal>
    );
};
```

---

## Database Architecture

### Abstraction Layer Philosophy

The database is accessed through a three-implementation abstraction:

1. **`SQLiteDatabase`** - Production (native mobile, persistent)
2. **`FakeDatabase`** - Development/Testing (in-memory, web platform)
3. **`RemoteDatabase`** - Future (cloud sync, unimplemented)

All implementations conform to the `IDatabase` interface defined in `src/db/types.ts`.

### Key Architectural Decisions

**1. Singleton Pattern**

-   Single database instance per app lifecycle
-   Created via `getDatabase()` factory function
-   Stored in module-level variable
-   Accessed via `useDatabase()` hook from React Context

**2. Change Notification System**

-   `BaseDatabase` abstract class implements listener system
-   `addChangeListener()` and `removeChangeListener()` methods
-   `notifyChange()` called after any mutation
-   `DatabaseProvider` subscribes and invalidates entire React Query cache
-   Simple but effective: all queries refetch after any database change

**3. React Query Integration**

```typescript
// src/db/DatabaseContext.tsx
useEffect(() => {
    const handleChange = () => {
        queryClient.invalidateQueries(); // Invalidate everything
    };

    db.addChangeListener(handleChange);
    return () => db.removeChangeListener(handleChange);
}, [db, queryClient]);
```

**4. Normalized Schema**

-   Store → Aisles → Sections (hierarchical)
-   Items have `normalizedName` for case-insensitive search
-   Shopping list items reference stores, aisles, sections via foreign keys
-   Soft deletes with timestamp columns
-   JOIN queries return denormalized views for display

**4a. Store Layout Schema: Aisles and Sections**

Aisles and sections form a strict parent-child hierarchy within stores. This relationship is enforced at the database level to maintain data integrity.

**Hierarchical Relationship:**

```
Store (id, name)
  └─ Aisle (id, store_id, name, sort_order)
       └─ Section (id, store_id, aisle_id, name, sort_order)
```

**Schema Definition:**

```sql
CREATE TABLE store_aisle (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE
);

CREATE TABLE store_section (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  aisle_id TEXT NOT NULL,  -- Required! Sections MUST belong to an aisle
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE,
  FOREIGN KEY (aisle_id) REFERENCES store_aisle(id) ON DELETE CASCADE
);
```

**Key Constraints:**

-   **Sections must have an aisle**: `aisle_id TEXT NOT NULL` prevents orphaned sections from existing in the database
-   **CASCADE deletion**: Deleting an aisle automatically removes all its child sections (enforced by SQLite)
-   **Empty aisles are allowed**: Aisles can exist without sections (useful for simple store layouts or during initial setup)
-   **Sort order is aisle-scoped**: Section `sort_order` values are scoped to their parent aisle, not globally across the store. Multiple sections in different aisles can have the same `sort_order` value.

**Business Rules:**

1. **Section creation**: Sections cannot be created without specifying a valid parent aisle. The `insertSection()` database method requires an `aisleId` parameter.

2. **Section reassignment**: Sections can be moved between aisles by updating their `aisle_id` via `updateSection()`. When moving sections between aisles:

    - The section's `aisle_id` is updated to the new parent aisle
    - The `sort_order` is recalculated to place the section in the correct position within the destination aisle
    - Other sections in both source and destination aisles have their `sort_order` values adjusted to close gaps and make room

3. **Aisle deletion**: Deleting an aisle cascades to all its sections. This is intentional—if a store reorganizes and removes an aisle, its sections should not persist as orphaned data.

4. **Reordering behavior**:
    - `useReorderAisles()`: Reorders aisles within a store by updating `sort_order` values
    - `useReorderSections()`: Reorders sections within a single aisle by updating `sort_order` values
    - `useMoveSection()`: Moves a section to a different aisle by updating both `aisle_id` and `sort_order`

**UI Implementation:**

The [AisleSectionList.tsx](src/components/store/AisleSectionList.tsx) component uses a **flat IonReorderGroup** to enable both:

-   Dragging aisles to reorder them (all child sections move with the parent)
-   Dragging sections between aisles (updates `aisle_id` and recalculates `sort_order`)

The component uses data attributes (`data-item-type="aisle"` vs `data-item-type="section"`) to distinguish between aisle and section drag operations in the unified reorder handler.

**Common Pitfalls:**

-   ❌ **Don't try to create sections without an aisle**: `insertSection()` requires a valid `aisleId`. Attempting to pass `null` or omit this parameter will fail.
-   ❌ **Don't assume sections can exist across multiple aisles**: Each section belongs to exactly one aisle at a time. The relationship is 1:N (aisle:sections), not M:N.
-   ❌ **Don't expect global section sort order**: Section `sort_order` values restart at 0 for each aisle. When querying sections, always filter by `aisle_id` or join with aisles to understand their position.
-   ❌ **Don't forget CASCADE behavior**: Deleting an aisle permanently deletes all its sections. Always warn users before aisle deletion if sections exist.

**Why This Design:**

**Benefits:**

-   Enforces referential integrity at the database level
-   Prevents orphaned sections that don't belong to any aisle
-   CASCADE deletion simplifies store reorganization
-   Aisle-scoped sort order enables efficient reordering within aisles without affecting other aisles

**Tradeoffs:**

-   Cannot have "floating" sections that exist outside the aisle hierarchy
-   Aisle deletion is destructive (cascades to sections)
-   Moving sections between aisles requires multiple database operations (update `aisle_id` + recalculate `sort_order` for affected aisles)

**Code Examples:**

```typescript
// Create a section (must provide aisleId)
const createSection = useCreateSection();
await createSection.mutateAsync({
    storeId: "store-123",
    name: "Organic Produce",
    aisleId: "aisle-456", // Required!
});

// Move a section to a different aisle
const moveSection = useMoveSection();
await moveSection.mutateAsync({
    sectionId: "section-789",
    newAisleId: "aisle-999",
    newSortOrder: 2,
    sectionName: "Organic Produce",
    storeId: "store-123",
});

// Reorder sections within an aisle
const reorderSections = useReorderSections();
await reorderSections.mutateAsync({
    updates: [
        { id: "section-1", sort_order: 0 },
        { id: "section-2", sort_order: 1 },
        { id: "section-3", sort_order: 2 },
    ],
    storeId: "store-123",
});
```

**5. Type Safety**

-   All database methods return typed model objects
-   Type helpers: `Optional<T>`, `DatabaseInput<T>`
-   Separate input types for creation (e.g., `CreateStoreInput`)
-   Zod schemas validate database inputs and outputs

### Adding New Database Methods

When adding new database operations:

1. **Add to `IDatabase` interface** (`src/db/types.ts`)

    ```typescript
    export interface IDatabase {
        // Existing methods...
        getItemsByCategory(categoryId: string): Promise<StoreItem[]>;
    }
    ```

2. **Implement in `SQLiteDatabase`** (`src/db/sqlite.ts`)

    ```typescript
    async getItemsByCategory(categoryId: string): Promise<StoreItem[]> {
      const result = await this.db.query(
        'SELECT * FROM store_items WHERE category_id = ?',
        [categoryId]
      );
      return result.values?.map(row => this.mapRowToItem(row)) ?? [];
    }
    ```

3. **Implement in `FakeDatabase`** (`src/db/fake.ts`)

    ```typescript
    async getItemsByCategory(categoryId: string): Promise<StoreItem[]> {
      return this.items.filter(item => item.categoryId === categoryId);
    }
    ```

4. **Add React Query hook** (`src/db/hooks.ts`)

    ```typescript
    export const useItemsByCategory = (categoryId: string) => {
        const db = useDatabase();
        return useQuery({
            queryKey: ["items", "byCategory", categoryId],
            queryFn: () => db.getItemsByCategory(categoryId),
            enabled: !!categoryId, // Only run if categoryId exists
        });
    };
    ```

5. **Use in component**
    ```typescript
    const { data: items, isLoading } = useItemsByCategory(categoryId);
    ```

---

## Testing Conventions

### Unit Testing (Vitest)

**Setup:** `src/setupTests.ts`

-   Jest-DOM matchers imported
-   `window.matchMedia` mocked for Ionic components

**Running tests:**

```bash
npm run test      # Run all tests
npm run test:ui   # Run with Vitest UI
```

**Component test structure:**

```typescript
// MyComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
    it("renders the component", () => {
        render(<MyComponent />);
        expect(screen.getByText("Expected Text")).toBeInTheDocument();
    });

    it("handles user interaction", async () => {
        const user = userEvent.setup();
        render(<MyComponent />);

        await user.click(screen.getByRole("button", { name: "Submit" }));
        expect(screen.getByText("Success")).toBeInTheDocument();
    });
});
```

**Testing database operations:**

```typescript
// Use FakeDatabase for tests
import { FakeDatabase } from "@/db/fake";

describe("Database operations", () => {
    it("creates a store", async () => {
        const db = new FakeDatabase();
        await db.initialize();

        const store = await db.createStore({
            name: "Test Store",
            color: "#00ff00",
        });
        expect(store.name).toBe("Test Store");

        const stores = await db.getStores();
        expect(stores).toHaveLength(1);
    });
});
```

### E2E Testing (Cypress)

**Setup:** `cypress.config.ts`

-   Base URL: `http://localhost:5173`
-   E2E tests in `cypress/e2e/`

**Running tests:**

```bash
npm run cypress:open   # Open Cypress UI
npm run cypress:run    # Run headless
```

**Test structure:**

```typescript
// cypress/e2e/shopping-list.cy.ts
describe("Shopping List", () => {
    beforeEach(() => {
        cy.visit("/shopping-list");
    });

    it("adds a new item", () => {
        cy.get('[data-testid="add-item-button"]').click();
        cy.get('input[name="name"]').type("Milk");
        cy.get('button[type="submit"]').click();

        cy.contains("Milk").should("be.visible");
    });
});
```

**Testing conventions:**

-   Use `data-testid` attributes for stable selectors
-   Test user flows, not implementation details
-   Mock API calls for consistent tests
-   Use FakeDatabase for predictable test data

---

## Architectural Decision Records

### Why Three-File Context Pattern?

**Problem:** Context usage errors are common (forgetting provider, accessing undefined context).

**Solution:** Separate definition, implementation, and consumption with error-checking hook.

**Benefits:**

-   Error checking enforced at hook level
-   Testing easier (mock provider independently)
-   Clearer separation of concerns
-   Prevents "Cannot read property X of undefined" errors

### Why Database Abstraction Layer?

**Problem:** SQLite only works on native platforms. Development on web requires different storage.

**Solution:** Abstract database interface with multiple implementations.

**Benefits:**

-   Develop on web without native platform
-   Test with in-memory database (fast, deterministic)
-   Future-proof for cloud sync (RemoteDatabase)
-   Type-safe API regardless of implementation

### Why Global Cache Invalidation on Database Changes?

**Problem:** Need to keep React Query cache in sync with database changes.

**Solution:** DatabaseProvider invalidates entire cache on any database change.

**Benefits:**

-   Simple implementation (one listener, one invalidation call)
-   Always correct (no stale data possible)
-   No manual invalidation tracking per query

**Tradeoffs:**

-   All queries refetch after any mutation (could be inefficient at scale)
-   Currently acceptable for this app's data volume

**Future optimization:**

-   Targeted invalidation per entity type
-   Debounced invalidation for bulk operations

### Why React Query Instead of Direct State Management?

**Problem:** Database state requires loading states, error handling, caching, invalidation.

**Solution:** React Query manages all server/database state.

**Benefits:**

-   Automatic cache management
-   Built-in loading/error states
-   Optimistic updates
-   Deduplication of requests
-   Background refetching
-   Standardized patterns across app

### Why Zod + React Hook Form?

**Problem:** Need runtime validation for external data (LLM responses, user input) with type safety.

**Solution:** Zod for schema definition + validation, React Hook Form for form state.

**Benefits:**

-   Single source of truth (Zod schema → TypeScript type)
-   Runtime validation catches invalid data
-   Automatic error message display
-   Type-safe form data
-   Reduced boilerplate

### Why Reusable LLM Infrastructure?

**Problem:** Multiple AI features would duplicate modal UI, loading states, API calls, error handling.

**Solution:** `LLMModal` + `LLMModalContext` + `callLLMDirect()` for all LLM features.

**Benefits:**

-   Consistent UX across AI features
-   No code duplication
-   Centralized API key management
-   Standardized error handling
-   Easy to add new AI features (just define prompt and response schema)

**Constraints:**

-   Features must fit modal-based or direct-call patterns
-   Can't customize modal UI per feature (only renderOutput)

---

## Common Patterns Reference

### Pattern: Optimistic Updates

For mutations where you want immediate UI feedback:

```typescript
export const useCheckItem = () => {
    const db = useDatabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
            db.updateShoppingListItem(id, { checked }),

        // Optimistically update UI before server responds
        onMutate: async ({ id, checked }) => {
            await queryClient.cancelQueries({ queryKey: ["shopping-list"] });

            const previousItems = queryClient.getQueryData<ShoppingListItem[]>([
                "shopping-list",
            ]);

            queryClient.setQueryData<ShoppingListItem[]>(
                ["shopping-list"],
                (old) =>
                    old?.map((item) =>
                        item.id === id ? { ...item, checked } : item
                    )
            );

            return { previousItems }; // Return for rollback
        },

        // Rollback on error
        onError: (err, variables, context) => {
            if (context?.previousItems) {
                queryClient.setQueryData(
                    ["shopping-list"],
                    context.previousItems
                );
            }
        },

        // Always refetch to ensure consistency
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
        },
    });
};
```

### Pattern: Dependent Queries

When one query depends on data from another:

```typescript
const MyComponent = () => {
    // First query
    const { data: store } = useCurrentStore();

    // Second query depends on first
    const { data: aisles, isLoading } = useStoreAisles(store?.id ?? "", {
        enabled: !!store, // Only run if store exists
    });

    if (!store) return <IonSpinner />;
    if (isLoading) return <IonSpinner />;

    return <AisleList aisles={aisles} />;
};
```

### Pattern: Debounced Search

For search inputs that trigger database queries:

```typescript
import { useDebouncedValue } from "use-debounce";

const SearchComponent = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

    const { data: results } = useSearchItems(debouncedSearch);

    return (
        <>
            <IonInput
                value={searchTerm}
                onIonInput={(e) => setSearchTerm(e.detail.value ?? "")}
                placeholder="Search items..."
            />
            <ResultsList items={results} />
        </>
    );
};
```

### Pattern: Async Data with React Query

For async data (secure storage, database queries, API calls), always use React Query hooks which provide proper caching, loading states, and error handling:

```typescript
const MyComponent = () => {
    const { data: apiKey, isLoading, error } = useSecureApiKey();

    if (isLoading) {
        return <IonSpinner />;
    }

    if (error) {
        return <IonText color="danger">Failed to load API key</IonText>;
    }

    if (!apiKey) {
        return <IonText color="warning">No API key configured</IonText>;
    }

    // Use apiKey directly
    return <div>API Key loaded: {apiKey.slice(0, 10)}...</div>;
};
```

**Why React Query instead of use() hook:**

-   React 19's `use()` hook requires **cached/stable promises** (created outside render)
-   Calling `use(secureStorage.getApiKey())` creates uncached promises, causing errors
-   React Query provides the caching layer that `use()` requires
-   Automatic invalidation, refetching, and error handling

**Note:** The `use()` hook is for Context, stable promises passed as props, or Suspense-compatible libraries. For app data, use React Query hooks.

### Pattern: Modal with Form

Standard modal with form submission pattern:

```typescript
const EditorModal = () => {
    const { isOpen, closeModal, currentItem } = useEditorContext();
    const { control, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
    });
    const updateItem = useUpdateItem();
    const toast = useToast();

    // Reset form when modal opens with different item
    useEffect(() => {
        if (currentItem) {
            reset({ name: currentItem.name, quantity: currentItem.quantity });
        }
    }, [currentItem, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            await updateItem.mutateAsync({ id: currentItem!.id, ...data });
            toast.success("Item updated");
            closeModal();
        } catch (error) {
            toast.error("Failed to update item");
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={closeModal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit Item</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={closeModal}>
                            Can
                            <IonIcon icon={closeOutline} />
                            cel
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormInput name="name" control={control} label="Name" />
                    <FormInput
                        name="quantity"
                        control={control}
                        label="Quantity"
                        type="number"
                    />
                    <IonButton
                        expand="block"
                        type="submit"
                        disabled={updateItem.isPending}
                    >
                        {updateItem.isPending ? <IonSpinner /> : "Save"}
                    </IonButton>
                </form>
            </IonContent>
        </IonModal>
    );
};
```

---

## Quick Reference: File Templates

### New Component Template

```typescript
// src/components/feature/MyComponent.tsx
import { IonCard, IonText } from "@ionic/react";
import type { SomeType } from "@/db/types";
import "./MyComponent.css";

interface MyComponentProps {
    data: SomeType;
    onAction: (id: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ data, onAction }) => {
    const handleClick = () => {
        onAction(data.id);
    };

    return (
        <IonCard onClick={handleClick}>
            <IonText>{data.name}</IonText>
        </IonCard>
    );
};
```

### New Context Template

```typescript
// FeatureContext.tsx
import { createContext } from "react";

export interface FeatureContextValue {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const FeatureContext = createContext<FeatureContextValue | undefined>(
    undefined
);

// FeatureProvider.tsx
import { useState } from "react";
import { FeatureContext } from "./FeatureContext";

export const FeatureProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const value: FeatureContextValue = {
        isOpen,
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
    };

    return (
        <FeatureContext.Provider value={value}>
            {children}
        </FeatureContext.Provider>
    );
};

// useFeatureContext.ts
import { useContext } from "react";
import { FeatureContext } from "./FeatureContext";

export const useFeatureContext = () => {
    const context = useContext(FeatureContext);
    if (!context) {
        throw new Error(
            "useFeatureContext must be used within FeatureProvider"
        );
    }
    return context;
};
```

### New React Query Hook Template

```typescript
// src/db/hooks.ts

// Query (read)
export const useItems = () => {
    const db = useDatabase();
    return useQuery({
        queryKey: ["items"],
        queryFn: () => db.getItems(),
    });
};

// Mutation (write)
export const useCreateItem = () => {
    const db = useDatabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateItemInput) => db.createItem(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
        },
    });
};
```

### New LLM Feature Template

```typescript
// src/llm/features/myFeature.ts
import { z } from "zod";

const PROMPT = `
You are an AI that [describes task].

Return JSON in this exact format:
{
  "result": "value",
  "confidence": 0.95
}
`;

const responseSchema = z.object({
    result: z.string(),
    confidence: z.number().min(0).max(1),
});

export type MyFeatureResponse = z.infer<typeof responseSchema>;

export const validateMyFeatureResponse = (
    response: unknown
): MyFeatureResponse => {
    return responseSchema.parse(response);
};

export { PROMPT };
```

---

## Summary: Key Takeaways for AI Agents

When generating code for Basket Bot, remember:

1. **ALWAYS use React.FC and const arrow functions** - Never use function declarations for components or handlers
2. **NEVER create ad hoc interface declarations** - Import existing types from `src/db/types.ts` or `src/models/`, or add new types to appropriate model files
3. **CONSULT before creating infrastructure** - Don't build custom libraries/frameworks; use existing ones or ask first
4. **Never bypass the database abstraction** - All operations go through React Query hooks
5. **Use the LLM infrastructure** - Don't create custom OpenAI integration code
6. **Follow the three-file context pattern** - Definition, Provider, Hook
7. **Ionic components only** - No raw HTML elements
8. **Zod for all external data** - LLM responses, user input, API calls
9. **Type everything strictly** - No `any`, explicit return types, use Zod inference
10. **The tone is disdainful** - Success messages, empty states, and CTAs should sound slightly superior
11. **Test with FakeDatabase** - Fast, deterministic, no native platform needed
12. **Handle loading and error states** - Every query/mutation should show loading/error UI
13. **Keep business logic in hooks** - Components should be thin wrappers around hooks

14. **Do Not Stop Until All Problems Are Fixed**

    - After making any code changes, the agent must not stop working until all new "Problems" (compile errors, lint errors, or warnings) in the files it updated—or in any files affected by those changes—are identified and fixed.
    - This includes cascading issues that arise as a result of the initial change.
    - The agent should continue iterating until the workspace is free of new Problems caused by its edits.
    - Only then should the agent consider the task complete.

---

**Last Updated:** December 28, 2025  
**Target Audience:** AI coding agents, LLMs, automated code generation systems, future developers
