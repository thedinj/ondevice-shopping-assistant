import {
    IonItemSliding,
    IonItem,
    IonLabel,
    IonReorder,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonReorderGroup,
} from "@ionic/react";
import { create, trash } from "ionicons/icons";
import { useStoreManagement } from "./StoreManagementContext";
import { SectionItem } from "./SectionItem";
import { ItemReorderEventDetail } from "@ionic/core";

interface AisleItemProps {
    aisle: { id: string; name: string };
    sections: Array<{ id: string; name: string; aisle_id: string }>;
    onSectionReorder: (
        event: CustomEvent<ItemReorderEventDetail>,
        aisleId: string
    ) => void;
}

export const AisleItem = ({
    aisle,
    sections,
    onSectionReorder,
}: AisleItemProps) => {
    const { openEditAisleModal, confirmDeleteAisle } = useStoreManagement();

    const aisleSections = sections.filter((s) => s.aisle_id === aisle.id);

    return (
        <div>
            <IonItemSliding>
                <IonItem>
                    <IonLabel>
                        <h2 style={{ fontWeight: "bold" }}>{aisle.name}</h2>
                    </IonLabel>
                    <IonReorder slot="end" />
                </IonItem>
                <IonItemOptions side="end">
                    <IonItemOption
                        color="primary"
                        onClick={() => openEditAisleModal(aisle)}
                    >
                        <IonIcon slot="icon-only" icon={create} />
                    </IonItemOption>
                    <IonItemOption
                        color="danger"
                        onClick={() => confirmDeleteAisle(aisle)}
                    >
                        <IonIcon slot="icon-only" icon={trash} />
                    </IonItemOption>
                </IonItemOptions>
            </IonItemSliding>

            {aisleSections.length > 0 && (
                <IonReorderGroup
                    disabled={false}
                    onIonItemReorder={(e) => onSectionReorder(e, aisle.id)}
                >
                    {aisleSections.map((section) => (
                        <SectionItem key={section.id} section={section} />
                    ))}
                </IonReorderGroup>
            )}
        </div>
    );
};
