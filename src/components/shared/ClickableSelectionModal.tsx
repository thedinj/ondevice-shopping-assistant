import React, { useState, useMemo } from "react";
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonCheckbox,
} from "@ionic/react";

export interface SelectableItem {
    id: string;
    label: string;
}

interface ClickableSelectionModalProps {
    /** Array of items to display */
    items: SelectableItem[];
    /** Currently selected item ID */
    value?: string;
    /** Callback when an item is selected */
    onSelect: (itemId: string) => void;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback to dismiss the modal without selection */
    onDismiss: () => void;
    /** Title displayed in the modal header */
    title: string;
    /** Placeholder text for the search bar */
    searchPlaceholder?: string;
    /** Whether to show the search bar (default: true) */
    showSearch?: boolean;
}

/**
 * Reusable modal for selecting items from a list.
 * Features:
 * - Click an item to select it and automatically close the modal
 * - Optional search/filter functionality
 * - Checkbox indicator for currently selected item
 * - Clean, simple UX replacing IonSelect + OK/Cancel patterns
 */
export const ClickableSelectionModal: React.FC<ClickableSelectionModalProps> = ({
    items,
    value,
    onSelect,
    isOpen,
    onDismiss,
    title,
    searchPlaceholder = "Search...",
    showSearch = true,
}) => {
    const [searchText, setSearchText] = useState("");

    // Filter items based on search text
    const filteredItems = useMemo(() => {
        if (!searchText.trim()) {
            return items;
        }
        const lowerSearch = searchText.toLowerCase();
        return items.filter((item) =>
            item.label.toLowerCase().includes(lowerSearch)
        );
    }, [items, searchText]);

    const handleItemClick = (itemId: string) => {
        onSelect(itemId);
        setSearchText(""); // Reset search for next time
        onDismiss();
    };

    const handleDismiss = () => {
        setSearchText(""); // Reset search when dismissed
        onDismiss();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleDismiss}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
                {showSearch && (
                    <IonToolbar>
                        <IonSearchbar
                            value={searchText}
                            onIonInput={(e) => setSearchText(e.detail.value || "")}
                            placeholder={searchPlaceholder}
                            debounce={300}
                        />
                    </IonToolbar>
                )}
            </IonHeader>
            <IonContent>
                <IonList>
                    {filteredItems.length === 0 ? (
                        <IonItem>
                            <IonLabel color="medium">
                                {searchText ? "No matching items found" : "No items available"}
                            </IonLabel>
                        </IonItem>
                    ) : (
                        filteredItems.map((item) => (
                            <IonItem
                                key={item.id}
                                button
                                onClick={() => handleItemClick(item.id)}
                                detail={false}
                            >
                                <IonLabel>{item.label}</IonLabel>
                                {value === item.id && (
                                    <IonCheckbox slot="end" checked disabled />
                                )}
                            </IonItem>
                        ))
                    )}
                </IonList>
            </IonContent>
        </IonModal>
    );
};
