import { IonItem } from "@ionic/react";
import { useMemo, useState } from "react";
import { useStores } from "../../db/hooks";
import {
    ClickableSelectionModal,
    SelectableItem,
} from "./ClickableSelectionModal";

interface GenericStoreSelectorProps {
    selectedStoreId: string | null;
    onStoreSelect: (storeId: string | null) => void;
    triggerText?: string;
    placeholderText?: string;
    modalTitle?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    disabled?: boolean;
    excludeStoreIds?: string[];
}

export const GenericStoreSelector: React.FC<GenericStoreSelectorProps> = ({
    selectedStoreId,
    onStoreSelect,
    triggerText,
    placeholderText = "Select a store",
    modalTitle = "Select Store",
    showSearch = false,
    allowClear = true,
    disabled = false,
    excludeStoreIds = [],
}) => {
    const { data: stores, isLoading } = useStores();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredStores = useMemo(() => {
        if (!stores) return [];
        return stores.filter((store) => !excludeStoreIds.includes(store.id));
    }, [stores, excludeStoreIds]);

    const storeItems: SelectableItem[] = useMemo(() => {
        return filteredStores.map((store) => ({
            id: store.id,
            label: store.name,
        }));
    }, [filteredStores]);

    const selectedStore = stores?.find((s) => s.id === selectedStoreId);

    const handleSelect = (storeId: string | null) => {
        onStoreSelect(storeId);
        setIsModalOpen(false);
    };

    if (isLoading) {
        return null;
    }

    const displayText = triggerText
        ? triggerText
        : selectedStoreId
        ? selectedStore?.name
        : placeholderText;

    return (
        <>
            <IonItem
                button
                onClick={() => storeItems.length > 0 && setIsModalOpen(true)}
                disabled={disabled || storeItems.length === 0}
            >
                <div
                    style={{
                        color: selectedStoreId
                            ? "var(--ion-color-dark)"
                            : "var(--ion-color-medium)",
                    }}
                >
                    {displayText}
                </div>
            </IonItem>

            <ClickableSelectionModal
                items={storeItems}
                value={selectedStoreId || undefined}
                onSelect={handleSelect}
                isOpen={isModalOpen}
                onDismiss={() => setIsModalOpen(false)}
                title={modalTitle}
                showSearch={showSearch}
                allowClear={allowClear && storeItems.length > 1}
            />
        </>
    );
};
