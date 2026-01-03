import {
    IonButton,
    IonButtons,
    IonDatetime,
    IonDatetimeButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonModal,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { useRef } from "react";
import { Controller } from "react-hook-form";
import { useItemEditorContext } from "./useItemEditorContext";

export const SnoozeDateSelector: React.FC = () => {
    const { control, setValue, watch } = useItemEditorContext();
    const snoozedUntil = watch("snoozedUntil");
    const modalRef = useRef<HTMLIonModalElement>(null);

    // Calculate tomorrow's date as minimum
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const clearSnooze = () => {
        setValue("snoozedUntil", null);
    };

    const openModal = () => {
        modalRef.current?.present();
    };

    const handleModalDismiss = () => {
        modalRef.current?.dismiss();
    };

    return (
        <IonItem>
            <IonLabel position="stacked">Snooze Until</IonLabel>
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    width: "100%",
                    marginTop: "8px",
                }}
            >
                <Controller
                    name="snoozedUntil"
                    control={control}
                    render={({ field }) => (
                        <>
                            {snoozedUntil ? (
                                <IonDatetimeButton datetime="snooze-datetime" />
                            ) : (
                                <IonButton size="default" onClick={openModal}>
                                    Set Snooze Date
                                </IonButton>
                            )}
                            <IonModal ref={modalRef} keepContentsMounted={true}>
                                <IonHeader>
                                    <IonToolbar>
                                        <IonTitle>Select Snooze Date</IonTitle>
                                        <IonButtons slot="end">
                                            <IonButton
                                                onClick={handleModalDismiss}
                                            >
                                                <IonIcon icon={closeOutline} />
                                            </IonButton>
                                        </IonButtons>
                                    </IonToolbar>
                                </IonHeader>
                                <IonDatetime
                                    id="snooze-datetime"
                                    presentation="date"
                                    min={minDate}
                                    value={field.value || undefined}
                                    onIonChange={(e) => {
                                        const value = e.detail.value;
                                        if (typeof value === "string") {
                                            field.onChange(value);
                                            modalRef.current?.dismiss();
                                        }
                                    }}
                                />
                            </IonModal>
                        </>
                    )}
                />
                {snoozedUntil && (
                    <IonButton size="small" fill="clear" onClick={clearSnooze}>
                        Clear
                    </IonButton>
                )}
            </div>
        </IonItem>
    );
};
