# App Header & Menu System

## Overview

The app uses a two-tier menu system following mobile app standards:

1. **App-level hamburger menu** (left side) - Static menu with app branding and Settings access
2. **Page-level overflow menu** (right side) - Dynamic 3-dot menu for page-specific actions

## Architecture

### Components

-   **AppHeaderContext.tsx** - Context definition
-   **AppHeaderProvider.tsx** - Provider with state management
-   **useAppHeader.ts** - Hook to access context
-   **AppHeader.tsx** - Reusable header component with hamburger and page menu
-   **AppMenu.tsx** - Side hamburger menu (app-level)

### Context API

```typescript
interface PageMenuItemConfig {
    id: string;
    icon: string;
    label: string;
    onClick: () => void;
    color?: string;
}

interface AppHeaderContextValue {
    // Settings modal control
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;

    // Page menu control
    pageMenuItems: PageMenuItemConfig[];
    addPageMenuItem: (config: PageMenuItemConfig) => void;
    removePageMenuItem: (id: string) => void;
    clearPageMenuItems: () => void;
}
```

## Usage

### Basic Page Header

For pages that don't need a back button or custom menu:

```typescript
import { AppHeader } from "../components/layout/AppHeader";

const MyPage: React.FC = () => {
    return (
        <IonPage>
            <AppHeader title="My Page" />
            <IonContent>{/* Page content */}</IonContent>
        </IonPage>
    );
};
```

### Page with Back Button

For pages that need navigation back:

```typescript
<AppHeader title="Store Items" showBackButton backButtonHref="/stores" />
```

### Page with Custom Header Buttons

You can add custom buttons to the header by passing children (they appear before the 3-dot menu):

```typescript
<AppHeader title="Store Details" showBackButton backButtonHref="/stores">
    <IonButton onClick={handleEdit}>
        <IonIcon icon={create} />
    </IonButton>
</AppHeader>
```

### Adding Page Menu Items

Pages can add actions to the 3-dot overflow menu using structured config objects:

```typescript
import { useEffect } from "react";
import { trash, create, shareSocial } from "ionicons/icons";
import { useAppHeader } from "../components/layout/useAppHeader";

const StoreDetailPage: React.FC = () => {
    const { addPageMenuItem, removePageMenuItem } = useAppHeader();

    useEffect(() => {
        // Add page-specific menu items
        addPageMenuItem({
            id: "edit-store",
            icon: create,
            label: "Edit Store",
            onClick: handleEdit,
        });

        addPageMenuItem({
            id: "share-store",
            icon: shareSocial,
            label: "Share Store",
            onClick: handleShare,
        });

        addPageMenuItem({
            id: "delete-store",
            icon: trash,
            label: "Delete Store",
            onClick: handleDelete,
            color: "danger",
        });

        // Cleanup on unmount
        return () => {
            removePageMenuItem("edit-store");
            removePageMenuItem("share-store");
            removePageMenuItem("delete-store");
        };
    }, [addPageMenuItem, removePageMenuItem]);

    return (
        <IonPage>
            <AppHeader title="Store Details" />
            <IonContent>{/* Page content */}</IonContent>
        </IonPage>
    );
};
```

**Important**: Page menu items are automatically cleared on route changes, but you should still manually remove them in cleanup to ensure proper behavior.

## Menu System Details

### Hamburger Menu (App-Level)

The hamburger menu is **static** and contains:

-   App branding (icon + "Basket Bot" title)
-   Settings link

This menu is accessed from the left side of every page header and provides app-wide functionality.

### Page Menu (Page-Level)

The 3-dot overflow menu is **dynamic** and contains page-specific actions. It:

-   Only appears when a page has added menu items
-   Automatically hides when empty
-   Opens as a popover aligned to the top-right
-   Auto-closes after selecting an action

This menu follows mobile app standards for contextual actions.

## Implementation Details

### App.tsx Structure

```typescript
const AppContent: React.FC = () => {
    const location = useLocation();
    const { clearPageMenuItems } = useAppHeader();

    // Auto-clear page menu items on route change
    useEffect(() => {
        clearPageMenuItems();
    }, [location.pathname, clearPageMenuItems]);

    return (
        <>
            <AppMenu />
            <IonTabs>
                <IonRouterOutlet id="main-content">
                    {/* Routes */}
                </IonRouterOutlet>
                <IonTabBar>
                    {/* Only Shopping List and Stores tabs */}
                </IonTabBar>
            </IonTabs>
        </>
    );
};
```

### AppMenu Structure (Hamburger)

The hamburger menu is simple and static:

```typescript
<IonMenu contentId="main-content" type="overlay">
    <IonHeader>
        <IonToolbar>
            <IonTitle>
                <img src="/img/icon.png" />
                <span>Basket Bot</span>
            </IonTitle>
        </IonToolbar>
    </IonHeader>
    <IonContent>
        <IonList>
            <IonItem button onClick={openSettings}>
                <IonIcon icon={settings} />
                <IonLabel>Settings</IonLabel>
            </IonItem>
        </IonList>
    </IonContent>
</IonMenu>
```

### AppHeader Structure (Page Menu)

The page header includes the 3-dot menu:

```typescript
<IonHeader>
    <IonToolbar>
        <IonButtons slot="start">
            <IonMenuButton /> {/* Hamburger */}
            {showBackButton && <IonBackButton />}
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
            {children} {/* Custom buttons */}
            {pageMenuItems.length > 0 && (
                <IonButton id="page-menu-trigger">
                    <IonIcon icon={ellipsisVertical} />
                </IonButton>
            )}
        </IonButtons>
    </IonToolbar>
</IonHeader>
```

The page menu uses IonPopover to display items in a dropdown:

```typescript
<IonPopover
    trigger="page-menu-trigger"
    isOpen={showPageMenu}
    onDidDismiss={() => setShowPageMenu(false)}
    side="bottom"
    alignment="end"
>
    <IonList>
        {pageMenuItems.map((item) => (
            <IonItem
                key={item.id}
                button
                onClick={() => {
                    item.onClick();
                    setShowPageMenu(false);
                }}
            >
                <IonIcon icon={item.icon} slot="start" color={item.color} />
                <IonLabel color={item.color}>{item.label}</IonLabel>
            </IonItem>
        ))}
    </IonList>
</IonPopover>
```

## Migration Notes

### Changes from Previous Implementation

1. **Menu system split** - Hamburger menu (app-level) separated from page menu (page-level)
2. **Renamed identifiers** - `customMenuItems` → `pageMenuItems`, `addMenuItem` → `addPageMenuItem`, etc.
3. **Simplified hamburger menu** - Only contains app branding and Settings
4. **New 3-dot page menu** - Uses IonPopover for page-specific actions
5. **Structured menu items** - Uses `PageMenuItemConfig` interface instead of raw ReactNode

### Updated Components

-   ✅ AppHeaderContext.tsx - Renamed to `pageMenuItems` and `PageMenuItemConfig`
-   ✅ AppHeaderProvider.tsx - Updated method names
-   ✅ AppMenu.tsx - Simplified to only show Settings
-   ✅ AppHeader.tsx - Added 3-dot menu with IonPopover
-   ✅ App.tsx - Updated to call `clearPageMenuItems`

### Pages Using System

-   ✅ ShoppingList.tsx - Uses AppHeader
-   ✅ StoresList.tsx - Uses AppHeader
-   ✅ StoreDetail.tsx - Uses AppHeader with custom buttons
-   ✅ StoreItemsPage.tsx - Uses AppHeader with back button
-   ✅ StoreAislesPage.tsx - Uses AppHeader with back button

## Best Practices

1. **Use structured configs** - Always use `PageMenuItemConfig` objects with icon, label, onClick
2. **Unique IDs** - Use descriptive, unique IDs for page menu items (e.g., "delete-store", not "item1")
3. **Cleanup in useEffect** - Always remove page menu items in cleanup function
4. **Icons** - Use ionicons with string names (e.g., `trash`, `create`)
5. **Destructive actions** - Use `color="danger"` for delete/remove items
6. **Auto-close behavior** - Popover automatically closes after selection

## Example: Complex Page Menu

```typescript
const StoreDetailPage: React.FC = () => {
    const { addPageMenuItem, removePageMenuItem } = useAppHeader();
    const history = useHistory();

    useEffect(() => {
        // Multiple page menu items
        addPageMenuItem({
            id: "edit-layout",
            icon: gridOutline,
            label: "Edit Layout",
            onClick: () => history.push(`/stores/${storeId}/aisles`),
        });

        addPageMenuItem({
            id: "manage-items",
            icon: listOutline,
            label: "Manage Items",
            onClick: () => history.push(`/stores/${storeId}/items`),
        });

        addPageMenuItem({
            id: "delete-store",
            icon: trash,
            label: "Delete Store",
            onClick: handleDeleteStore,
            color: "danger",
        });

        return () => {
            removePageMenuItem("edit-layout");
            removePageMenuItem("manage-items");
            removePageMenuItem("delete-store");
        };
    }, [addPageMenuItem, removePageMenuItem, storeId]);

    return (
        <IonPage>
            <AppHeader title="Store" showBackButton backButtonHref="/stores" />
            <IonContent>{/* Content */}</IonContent>
        </IonPage>
    );
};
```

## Troubleshooting

### Page menu not appearing

Check that:

1. You're calling `addPageMenuItem()` with a valid config
2. The page is using `<AppHeader>` component
3. The menu items array is not empty

### Menu items not clearing on navigation

Ensure:

1. `App.tsx` has the route change cleanup effect
2. Your page's `useEffect` cleanup function removes items
3. You're not preventing the effect from running

### Popover positioning issues

The popover is configured with:

-   `side="bottom"` - Opens below the trigger
-   `alignment="end"` - Aligns to right edge
-   Auto-closes after selection

These settings follow mobile app standards and shouldn't need customization.
</IonPage>
);
};

```

## Troubleshooting

**Menu items not appearing**: Ensure you're calling `addMenuItem` within `useEffect` and the component is mounted.

**Menu items not clearing**: The `AppContent` component in `App.tsx` automatically clears items on route changes. If items persist, check that `clearMenuItems` is being called in the route change effect.

**Back button not working**: Verify `showBackButton={true}` and `backButtonHref` props are set correctly.

**Menu not opening**: The hamburger icon button automatically calls `openMenu()`. If manually triggering, ensure you're using the `useAppHeader` hook within the `AppHeaderProvider`.
```
