import {
    IonButton,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonToast,
} from "@ionic/react";
import { useCallback } from "react";
import { useResetDatabase } from "../db/hooks";

const Settings: React.FC = () => {
    const [present] = useIonToast();
    const { mutateAsync: resetDatabase } = useResetDatabase();
    const resetOnClick = useCallback(async () => {
        try {
            await resetDatabase(undefined);
            await present({
                message: "Database reset successfully",
                duration: 3000,
                color: "success",
                position: "top",
            });
        } catch (error) {
            // Error toast is automatically shown by mutation hook
            console.error("Database reset error:", error);
        }
    }, [resetDatabase, present]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {/* <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Tab 3</IonTitle>
                    </IonToolbar>
                </IonHeader> */}
                <IonButton onClick={resetOnClick}>Reset Database</IonButton>
            </IonContent>
        </IonPage>
    );
};

export default Settings;

