import {
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonReorder,
    IonReorderGroup,
} from "@ionic/react";
import { create } from "ionicons/icons";
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
    const { openEditAisleModal } = useStoreManagement();

    const aisleSections = sections.filter((s) => s.aisle_id === aisle.id);

    return (
        <div>
            <IonItem>
                <IonLabel>
                    <h2 style={{ fontWeight: "bold" }}>{aisle.name}</h2>
                </IonLabel>
                <IonButton
                    slot="end"
                    fill="clear"
                    onClick={() => openEditAisleModal(aisle)}
                >
                    <IonIcon icon={create} color="medium" />
                </IonButton>
                <IonReorder slot="end" />
            </IonItem>

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
