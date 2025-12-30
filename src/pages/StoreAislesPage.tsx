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
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { FabSpacer } from "../components/shared/FabSpacer";
import AisleSectionList from "../components/store/AisleSectionList";
import { ListHandle } from "../components/store/types";
import { useStore } from "../db/hooks";

const StoreAislesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: store } = useStore(id);
    const listRef = useRef<ListHandle>(null);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/stores/${id}`} />
                    </IonButtons>
                    <IonTitle>
                        {store?.name || "Store"} Aisles & Sections
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <AisleSectionList storeId={id} ref={listRef} />
                <FabSpacer />
                <IonFab slot="fixed" vertical="bottom" horizontal="end">
                    <IonFabButton
                        onClick={() => listRef.current?.openCreateModal()}
                    >
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default StoreAislesPage;
