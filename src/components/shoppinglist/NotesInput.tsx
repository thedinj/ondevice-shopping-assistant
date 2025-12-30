import { IonInput, IonItem, IonLabel } from "@ionic/react";
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
                    <IonInput
                        value={field.value || ""}
                        placeholder="Enter any notes"
                        onIonInput={(e) =>
                            field.onChange(e.detail.value || null)
                        }
                    />
                </IonItem>
            )}
        />
    );
};
