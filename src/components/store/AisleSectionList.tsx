import { forwardRef, useImperativeHandle } from "react";
import { IonList, IonReorderGroup } from "@ionic/react";
import { ItemReorderEventDetail } from "@ionic/core";
import {
    useStoreAisles,
    useStoreSections,
    useReorderAisles,
    useReorderSections,
} from "../../db/hooks";
import { ListHandle } from "../../pages/StoreDetail";
import { useStoreManagement } from "./StoreManagementContext";
import { StoreManagementProvider } from "./StoreManagementProvider";
import { EntityFormModal } from "./EntityFormModal";
import { DeleteConfirmationAlert } from "./DeleteConfirmationAlert";
import { AisleItem } from "./AisleItem";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface AisleSectionListProps {
    storeId: string;
}

const AisleSectionListContent = forwardRef<ListHandle, AisleSectionListProps>(
    ({ storeId }, ref) => {
        const { data: aisles, isLoading: aislesLoading } =
            useStoreAisles(storeId);
        const { data: sections, isLoading: sectionsLoading } =
            useStoreSections(storeId);
        const reorderAisles = useReorderAisles();
        const reorderSections = useReorderSections();

        const { openCreateModal } = useStoreManagement();

        useImperativeHandle(ref, () => ({
            openCreateModal,
        }));

        const handleAisleReorder = async (
            event: CustomEvent<ItemReorderEventDetail>
        ) => {
            if (!aisles) return;

            const from = event.detail.from;
            const to = event.detail.to;

            const reordered = [...aisles];
            const [movedItem] = reordered.splice(from, 1);
            reordered.splice(to, 0, movedItem);

            const updates = reordered.map((aisle, index) => ({
                id: aisle.id,
                sort_order: index,
            }));

            await reorderAisles.mutateAsync({ updates, storeId });

            event.detail.complete();
        };

        const handleSectionReorder = async (
            event: CustomEvent<ItemReorderEventDetail>,
            aisleId: string
        ) => {
            event.stopPropagation();

            if (!sections) return;

            const aisleSections = sections.filter(
                (s) => s.aisle_id === aisleId
            );
            const from = event.detail.from;
            const to = event.detail.to;

            const reordered = [...aisleSections];
            const [movedItem] = reordered.splice(from, 1);
            reordered.splice(to, 0, movedItem);

            const updates = reordered.map((section, index) => ({
                id: section.id,
                sort_order: index,
            }));

            await reorderSections.mutateAsync({ updates, storeId });

            event.detail.complete();
        };

        const isLoading = aislesLoading || sectionsLoading;

        if (isLoading) {
            return (
                <>
                    <LoadingState />
                    <EntityFormModal storeId={storeId} aisles={aisles} />
                    <DeleteConfirmationAlert storeId={storeId} />
                </>
            );
        }

        if (
            !aisles ||
            !sections ||
            (aisles.length === 0 && sections.length === 0)
        ) {
            return (
                <>
                    <EmptyState />
                    <EntityFormModal storeId={storeId} aisles={aisles} />
                    <DeleteConfirmationAlert storeId={storeId} />
                </>
            );
        }

        return (
            <>
                <IonList>
                    <IonReorderGroup
                        disabled={false}
                        onIonItemReorder={handleAisleReorder}
                    >
                        {aisles.map((aisle) => (
                            <AisleItem
                                key={aisle.id}
                                aisle={aisle}
                                sections={sections}
                                onSectionReorder={handleSectionReorder}
                            />
                        ))}
                    </IonReorderGroup>
                </IonList>

                <EntityFormModal storeId={storeId} aisles={aisles} />
                <DeleteConfirmationAlert storeId={storeId} />
            </>
        );
    }
);

const AisleSectionList = forwardRef<ListHandle, AisleSectionListProps>(
    (props, ref) => {
        return (
            <StoreManagementProvider>
                <AisleSectionListContent {...props} ref={ref} />
            </StoreManagementProvider>
        );
    }
);

export default AisleSectionList;
