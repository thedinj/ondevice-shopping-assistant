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
import { useRef } from "react";
import { useStore } from "../db/hooks";
import AisleSectionList from "../components/store/AisleSectionList";
import { ListHandle } from "../components/store/types";

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
