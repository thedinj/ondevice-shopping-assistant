import {
    IonButton,
    IonContent,
    IonHeader,
    IonList,
    IonListHeader,
    IonPage,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { useCallback } from "react";
import { FormPasswordInput } from "../components/form/FormPasswordInput";
import { useResetDatabase } from "../db/hooks";
import { useToast } from "../hooks/useToast";
import { useSettingsForm } from "../settings/useSettingsForm";

const Settings: React.FC = () => {
    const { showSuccess } = useToast();
    const { mutateAsync: resetDatabase } = useResetDatabase();
    const { form, onSubmit, isLoading, isSubmitting } = useSettingsForm();

    const resetOnClick = useCallback(async () => {
        try {
            await resetDatabase(undefined);
            showSuccess("Database reset successfully");
        } catch (error) {
            // Error toast is automatically shown by mutation hook
            console.error("Database reset error:", error);
        }
    }, [resetDatabase, showSuccess]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <form onSubmit={onSubmit}>
                    {/* API Settings Section */}
                    <IonList>
                        <IonListHeader>
                            <h2>API Configuration</h2>
                        </IonListHeader>

                        {isLoading ? (
                            <IonSkeletonText
                                animated
                                style={{ height: "60px", margin: "10px" }}
                            />
                        ) : (
                            <FormPasswordInput
                                name="openaiApiKey"
                                control={form.control}
                                label="OpenAI API Key"
                                placeholder="sk-..."
                                helperText="Enter your OpenAI API key for AI-powered features"
                                disabled={isSubmitting}
                            />
                        )}

                        <div className="ion-padding">
                            <IonButton
                                expand="block"
                                type="submit"
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting ? "Saving..." : "Save Settings"}
                            </IonButton>
                        </div>
                    </IonList>

                    {/* Database Section */}
                    <IonList>
                        <IonListHeader>
                            <h2>Database</h2>
                        </IonListHeader>
                        <div className="ion-padding">
                            <IonButton
                                expand="block"
                                color="danger"
                                onClick={resetOnClick}
                            >
                                Reset Database
                            </IonButton>
                        </div>
                    </IonList>
                </form>
            </IonContent>
        </IonPage>
    );
};

export default Settings;

