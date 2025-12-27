import { useState, useMemo } from "react";
import { IonItem, IonLabel } from "@ionic/react";
import { Controller } from "react-hook-form";
import { useQuantityUnits } from "../../db/hooks";
import { useItemEditorContext } from "./useItemEditorContext";
import {
    ClickableSelectionModal,
    SelectableItem,
} from "../shared/ClickableSelectionModal";

export const UnitSelector = () => {
    const { control, errors } = useItemEditorContext();
    const { data: units, isLoading } = useQuantityUnits();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const unitItems: SelectableItem[] = useMemo(() => {
        return units
            ?.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation))
            .map((unit) => ({
                id: unit.id,
                label: unit.abbreviation,
            })) || [];
    }, [units]);

    if (isLoading) {
        return null;
    }

    return (
        <Controller
            name="unitId"
            control={control}
            render={({ field: { onChange, value } }) => {
                const selectedUnit = units?.find((u) => u.id === value);
                
                return (
                    <>
                        <IonItem 
                            button 
                            onClick={() => unitItems.length > 0 && setIsModalOpen(true)}
                            disabled={unitItems.length === 0}
                        >
                            <IonLabel position="stacked">Unit</IonLabel>
                            <div style={{ color: value ? "var(--ion-color-dark)" : "var(--ion-color-medium)" }}>
                                {value ? selectedUnit?.abbreviation : "No unit"}
                            </div>
                        </IonItem>

                        <ClickableSelectionModal
                            items={unitItems}
                            value={value || undefined}
                            onSelect={(unitId) => onChange(unitId)}
                            isOpen={isModalOpen}
                            onDismiss={() => setIsModalOpen(false)}
                            title="Select Unit"
                            searchPlaceholder="Search units..."
                            showSearch={true}
                        />

                        {errors.unitId && (
                            <div style={{ color: "red", fontSize: "12px", marginLeft: "16px" }}>
                                {errors.unitId.message}
                            </div>
                        )}
                    </>
                );
            }}
        />
    );
};
