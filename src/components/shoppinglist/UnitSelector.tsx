import { IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/react";
import { Controller } from "react-hook-form";
import { useQuantityUnits } from "../../db/hooks";
import { useItemEditorContext } from "./useItemEditorContext";

export const UnitSelector = () => {
    const { control, errors } = useItemEditorContext();
    const { data: units, isLoading } = useQuantityUnits();

    if (isLoading) {
        return null;
    }

    return (
        <Controller
            name="unitId"
            control={control}
            render={({ field: { onChange, value } }) => (
                <IonItem>
                    <IonLabel position="stacked">Unit</IonLabel>
                    <IonSelect
                        value={value || undefined}
                        placeholder="Select unit"
                        onIonChange={(e) => onChange(e.detail.value || null)}
                        interface="action-sheet"
                    >
                        <IonSelectOption value={undefined}>
                            No unit
                        </IonSelectOption>
                        {units
                            ?.sort((a, b) =>
                                a.abbreviation.localeCompare(b.abbreviation)
                            )
                            .map((unit) => (
                                <IonSelectOption key={unit.id} value={unit.id}>
                                    {unit.abbreviation}
                                </IonSelectOption>
                            ))}
                    </IonSelect>
                    {errors.unitId && (
                        <div style={{ color: "red", fontSize: "12px" }}>
                            {errors.unitId.message}
                        </div>
                    )}
                </IonItem>
            )}
        />
    );
};
