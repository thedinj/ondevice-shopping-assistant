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
import { useEffect, useState } from "react";
import { Store } from "../models/Store";
import { useDatabase, useDatabaseChangeToken } from "../state/storehooks";

const StoresList: React.FC = () => {
    const database = useDatabase();
    const changeToken = useDatabaseChangeToken();
    const [stores, setStores] = useState<Store[]>([]);

    useEffect(() => {
        const fetchStores = async () => {
            const fetchedStores = await database.loadAllStores();
            setStores(fetchedStores);
        };

        fetchStores();
    }, [database, changeToken]);

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
                    {stores.map((store) => (
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

