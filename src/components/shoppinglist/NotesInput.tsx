import { IonItem, IonLabel, IonTextarea } from "@ionic/react";
import { Controller } from "react-hook-form";
import { useItemEditorContext } from "./useItemEditorContext";

export const NotesInput = () => {
    const { control } = useItemEditorContext();

    return (
        <Controller
            name="notes"
            control={control}
            render={({ field }) => (
                <IonItem>
                    <IonLabel position="stacked">Notes</IonLabel>
                    <IonTextarea
                        value={field.value || ""}
                        placeholder="Enter any notes"
                        rows={3}
                        onIonInput={(e) =>
                            field.onChange(e.detail.value || null)
                        }
                    />
                </IonItem>
            )}
        />
    );
};
