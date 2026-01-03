# App Header & Menu System

## Overview

The app now uses a hamburger menu accessible from every page, replacing the Settings tab. The system provides:

1. **Consistent header across all pages** with hamburger menu button
2. **Configurable back button** per page
3. **Custom menu items** that pages can add/remove dynamically
4. **Auto-cleanup** of custom menu items on route changes

## Architecture

### Components

-   **AppHeaderContext.tsx** - Context definition
-   **AppHeaderProvider.tsx** - Provider with state management
-   **useAppHeader.ts** - Hook to access context
-   **AppHeader.tsx** - Reusable header component
-   **AppMenu.tsx** - Side menu component

### Context API

```typescript
interface AppHeaderContextValue {
    isMenuOpen: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    customMenuItems: MenuItemConfig[];
    addMenuItem: (id: string, content: React.ReactNode) => void;
    removeMenuItem: (id: string) => void;
    clearMenuItems: () => void;
}
```

## Usage

### Basic Page Header

For pages that don't need a back button:

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

You can add custom buttons to the header by passing children:

```typescript
<AppHeader title="Store Details" showBackButton backButtonHref="/stores">
    <IonButtons slot="end">
        <IonButton onClick={handleEdit}>
            <IonIcon icon={create} />
        </IonButton>
    </IonButtons>
</AppHeader>
```

### Adding Custom Menu Items

Pages can add custom items to the hamburger menu that appear above the Settings link:

```typescript
import { useEffect } from "react";
import { IonItem, IonLabel, IonIcon, IonMenuToggle } from "@ionic/react";
import { trash } from "ionicons/icons";
import { useAppHeader } from "../components/layout/useAppHeader";

const StoreDetailPage: React.FC = () => {
    const { addMenuItem, removeMenuItem } = useAppHeader();

    useEffect(() => {
        // Add custom menu item when component mounts
        addMenuItem(
            "delete-store",
            <IonMenuToggle autoHide={false}>
                <IonItem button onClick={handleDelete}>
                    <IonIcon icon={trash} slot="start" color="danger" />
                    <IonLabel color="danger">Delete Store</IonLabel>
                </IonItem>
            </IonMenuToggle>
        );

        // Remove when component unmounts
        return () => removeMenuItem("delete-store");
    }, [addMenuItem, removeMenuItem]);

    return (
        <IonPage>
            <AppHeader title="Store Details" />
            <IonContent>{/* Page content */}</IonContent>
        </IonPage>
    );
};
```

**Important**: Custom menu items are automatically cleared on route changes, but you should still manually remove them in cleanup to ensure proper behavior.

### Programmatically Opening the Menu

If you need to open the menu from code (not recommended, but available):

```typescript
const { openMenu } = useAppHeader();

const handleSomeAction = () => {
    openMenu();
};
```

## Implementation Details

### App.tsx Structure

```typescript
const AppContent: React.FC = () => {
    const location = useLocation();
    const { clearMenuItems } = useAppHeader();

    // Auto-clear custom menu items on route change
    useEffect(() => {
        clearMenuItems();
    }, [location.pathname, clearMenuItems]);

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

### Menu Structure

The menu renders:

1. Custom menu items (added by pages)
2. Separator (if custom items exist)
3. Settings link (always visible)

```typescript
<IonMenu contentId="main-content" type="overlay">
    <IonContent>
        <IonList>
            {/* Custom items */}
            {customMenuItems.map((item) => (
                <div key={item.id}>{item.content}</div>
            ))}

            {/* Separator */}
            {customMenuItems.length > 0 && <div className="separator" />}

            {/* Settings */}
            <IonMenuToggle autoHide={false}>
                <IonItem button routerLink="/settings">
                    <IonIcon icon={settings} />
                    <IonLabel>Settings</IonLabel>
                </IonItem>
            </IonMenuToggle>
        </IonList>
    </IonContent>
</IonMenu>
```

## Migration Notes

### Changes from Previous Implementation

1. **Settings removed from tab bar** - Now accessible via hamburger menu
2. **IonHeader replaced** - Pages now use `<AppHeader>` component
3. **IonBackButton moved** - Configured via `showBackButton` prop
4. **Auto route cleanup** - Custom menu items cleared on navigation

### Pages Updated

-   ✅ Settings.tsx - Removed from tab bar, uses AppHeader
-   ✅ ShoppingList.tsx - Uses AppHeader
-   ✅ StoresList.tsx - Uses AppHeader
-   ✅ StoreDetail.tsx - Uses AppHeader with custom buttons
-   ✅ StoreItemsPage.tsx - Uses AppHeader with back button
-   ✅ StoreAislesPage.tsx - Uses AppHeader with back button

## Best Practices

1. **Use IonMenuToggle** - Wrap custom menu items with `<IonMenuToggle autoHide={false}>` to auto-close menu on click
2. **Unique IDs** - Use descriptive, unique IDs for custom menu items (e.g., "delete-store", not "item1")
3. **Cleanup in useEffect** - Always remove custom menu items in cleanup function
4. **Icons** - Use Ionic icons with `slot="start"` for consistency
5. **Destructive actions** - Use `color="danger"` for delete/remove items

## Example: Complex Custom Menu

```typescript
const StoreDetailPage: React.FC = () => {
    const { addMenuItem, removeMenuItem } = useAppHeader();
    const history = useHistory();

    useEffect(() => {
        // Multiple custom menu items
        addMenuItem(
            "edit-layout",
            <IonMenuToggle autoHide={false}>
                <IonItem button routerLink={`/stores/${storeId}/aisles`}>
                    <IonIcon icon={gridOutline} slot="start" />
                    <IonLabel>Edit Layout</IonLabel>
                </IonItem>
            </IonMenuToggle>
        );

        addMenuItem(
            "manage-items",
            <IonMenuToggle autoHide={false}>
                <IonItem button routerLink={`/stores/${storeId}/items`}>
                    <IonIcon icon={listOutline} slot="start" />
                    <IonLabel>Manage Items</IonLabel>
                </IonItem>
            </IonMenuToggle>
        );

        addMenuItem(
            "delete-store",
            <IonMenuToggle autoHide={false}>
                <IonItem button onClick={handleDeleteStore}>
                    <IonIcon icon={trash} slot="start" color="danger" />
                    <IonLabel color="danger">Delete Store</IonLabel>
                </IonItem>
            </IonMenuToggle>
        );

        return () => {
            removeMenuItem("edit-layout");
            removeMenuItem("manage-items");
            removeMenuItem("delete-store");
        };
    }, [addMenuItem, removeMenuItem, storeId]);

    return (
        <IonPage>
            <AppHeader title="Store" showBackButton backButtonHref="/stores" />
            <IonContent>{/* Content */}</IonContent>
        </IonPage>
    );
};
```

## Troubleshooting

**Menu items not appearing**: Ensure you're calling `addMenuItem` within `useEffect` and the component is mounted.

**Menu items not clearing**: The `AppContent` component in `App.tsx` automatically clears items on route changes. If items persist, check that `clearMenuItems` is being called in the route change effect.

**Back button not working**: Verify `showBackButton={true}` and `backButtonHref` props are set correctly.

**Menu not opening**: The hamburger icon button automatically calls `openMenu()`. If manually triggering, ensure you're using the `useAppHeader` hook within the `AppHeaderProvider`.
