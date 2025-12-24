import {
    IonAlert,
    IonButton,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { useCallback, useState } from "react";
import { useResetDatabase } from "../state/storehooks";

const Settings: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);
    const resetDatabase = useResetDatabase();
    const resetOnClick = useCallback(async () => {
        try {
            await resetDatabase();
            setMessage("Database reset successfully");
        } catch (error) {
            console.error("Database reset error:", error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            setMessage(`Error resetting database: ${errorMessage}`);
        }
    }, [resetDatabase]);

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
                <IonAlert
                    isOpen={!!message}
                    header="Message"
                    message={message ?? ""}
                    buttons={["OK"]}
                    onDidDismiss={() => setMessage(null)}
                ></IonAlert>
            </IonContent>
        </IonPage>
    );
};

export default Settings;

