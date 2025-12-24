import {
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { useStores } from "../db/hooks";
import type { Store } from "../models/Store";

const StoresList: React.FC = () => {
    const { data: stores = [] } = useStores();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Stores</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Stores Title</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonList>
                    {stores.map((store: Store) => (
                        <IonItem key={store.id}>
                            <IonLabel>{store.name}</IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default StoresList;
