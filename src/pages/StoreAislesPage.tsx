import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useParams } from "react-router-dom";
import { FabSpacer } from "../components/shared/FabSpacer";
import AisleSectionList from "../components/store/AisleSectionList";
import { useStoreManagement } from "../components/store/StoreManagementContext";
import { StoreManagementProvider } from "../components/store/StoreManagementProvider";
import { useStore } from "../db/hooks";

const StoreAislesPageContent: React.FC<{ storeId: string }> = ({
    storeId,
}) => {
    const { data: store } = useStore(storeId);
    const { openCreateModal, mode } = useStoreManagement();

    const handleFabClick = () => {
        if (mode === "aisles") {
            openCreateModal("aisle");
        } else {
            openCreateModal();
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/stores/${storeId}`} />
                    </IonButtons>
                    <IonTitle>
                        {store?.name || "Store"} Aisles & Sections
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <AisleSectionList storeId={storeId} />
                <FabSpacer />
                <IonFab slot="fixed" vertical="bottom" horizontal="end">
                    <IonFabButton onClick={handleFabClick}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

const StoreAislesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <StoreManagementProvider>
            <StoreAislesPageContent storeId={id} />
        </StoreManagementProvider>
    );
};

export default StoreAislesPage;
