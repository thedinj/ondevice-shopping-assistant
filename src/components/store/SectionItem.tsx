import {
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonReorder,
} from "@ionic/react";
import { create } from "ionicons/icons";
import { useStoreManagement } from "./StoreManagementContext";

interface SectionItemProps {
    section: { id: string; name: string; aisle_id: string };
}

export const SectionItem = ({ section }: SectionItemProps) => {
    const { openEditSectionModal } = useStoreManagement();

    return (
        <IonItem style={{ paddingLeft: "32px" }}>
            <IonLabel>
                <p>{section.name}</p>
            </IonLabel>
            <IonButton
                slot="end"
                fill="clear"
                onClick={() => openEditSectionModal(section)}
            >
                <IonIcon icon={create} color="medium" />
            </IonButton>
            <IonReorder slot="end" />
        </IonItem>
    );
};
