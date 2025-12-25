import {
    IonItemSliding,
    IonItem,
    IonLabel,
    IonReorder,
    IonItemOptions,
    IonItemOption,
    IonIcon,
} from "@ionic/react";
import { create, trash } from "ionicons/icons";
import { useStoreManagement } from "./StoreManagementContext";

interface SectionItemProps {
    section: { id: string; name: string; aisle_id: string };
}

export const SectionItem = ({ section }: SectionItemProps) => {
    const { openEditSectionModal, confirmDeleteSection } = useStoreManagement();

    return (
        <IonItemSliding>
            <IonItem style={{ paddingLeft: "32px" }}>
                <IonLabel>
                    <p>{section.name}</p>
                </IonLabel>
                <IonReorder slot="end" />
            </IonItem>
            <IonItemOptions side="end">
                <IonItemOption
                    color="primary"
                    onClick={() => openEditSectionModal(section)}
                >
                    <IonIcon slot="icon-only" icon={create} />
                </IonItemOption>
                <IonItemOption
                    color="danger"
                    onClick={() => confirmDeleteSection(section)}
                >
                    <IonIcon slot="icon-only" icon={trash} />
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};
