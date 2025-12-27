import { useMemo } from "react";
import { IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/react";
import {
    Controller,
    Control,
    UseFormSetValue,
    UseFormWatch,
    FieldValues,
} from "react-hook-form";
import { useStoreAisles, useStoreSections } from "../../db/hooks";
import { StoreAisle, StoreSection } from "../../models/Store";

interface LocationSelectorsProps<T extends FieldValues = FieldValues> {
    control: Control<T>;
    setValue: UseFormSetValue<T>;
    watch: UseFormWatch<T>;
    storeId: string;
    disabled?: boolean;
}

export function LocationSelectors<T extends FieldValues = FieldValues>({
    control,
    setValue,
    watch,
    storeId,
    disabled = false,
}: LocationSelectorsProps<T>) {
    const { data: aisles } = useStoreAisles(storeId);
    const { data: sections } = useStoreSections(storeId);

    const currentAisleId = watch("aisleId" as any);
    const currentSectionId = watch("sectionId" as any);

    // Filter and sort sections by selected aisle, then alphabetically
    const filteredSections = useMemo(() => {
        return sections
            ?.filter(
                (section: StoreSection) =>
                    !currentAisleId || section.aisle_id === currentAisleId
            )
            .sort((a: StoreSection, b: StoreSection) =>
                a.name.localeCompare(b.name)
            );
    }, [sections, currentAisleId]);

    // Sort aisles alphabetically
    const sortedAisles = useMemo(() => {
        return aisles
            ?.slice()
            .sort((a: StoreAisle, b: StoreAisle) =>
                a.name.localeCompare(b.name)
            );
    }, [aisles]);

    return (
        <>
            {/* Aisle */}
            <Controller
                name={"aisleId" as any}
                control={control}
                render={({ field }) => (
                    <IonItem>
                        <IonLabel position="stacked">Aisle</IonLabel>
                        <IonSelect
                            value={field.value ?? ""}
                            onIonChange={(e) => {
                                const value =
                                    e.detail.value === ""
                                        ? null
                                        : e.detail.value;
                                field.onChange(value);
                                // Clear section if aisle changed and section doesn't belong to new aisle
                                if (currentSectionId) {
                                    const section = sections?.find(
                                        (s: StoreSection) =>
                                            s.id === currentSectionId
                                    );
                                    if (section && section.aisle_id !== value) {
                                        setValue(
                                            "sectionId" as any,
                                            null as any
                                        );
                                    }
                                }
                            }}
                            disabled={disabled}
                        >
                            <IonSelectOption value="">None</IonSelectOption>
                            {sortedAisles?.map((aisle: StoreAisle) => (
                                <IonSelectOption
                                    key={aisle.id}
                                    value={aisle.id}
                                >
                                    {aisle.name}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                )}
            />

            {/* Section */}
            <Controller
                name={"sectionId" as any}
                control={control}
                render={({ field }) => (
                    <IonItem>
                        <IonLabel position="stacked">Section</IonLabel>
                        <IonSelect
                            value={field.value ?? ""}
                            onIonChange={(e) => {
                                const value =
                                    e.detail.value === ""
                                        ? null
                                        : e.detail.value;
                                field.onChange(value);

                                // If a section is selected, automatically set its aisle
                                if (value && sections) {
                                    const section = sections.find(
                                        (s: StoreSection) => s.id === value
                                    );
                                    if (section) {
                                        setValue(
                                            "aisleId" as any,
                                            section.aisle_id as any
                                        );
                                    }
                                }
                            }}
                            disabled={disabled || !filteredSections?.length}
                        >
                            <IonSelectOption value="">None</IonSelectOption>
                            {filteredSections?.map((section: StoreSection) => (
                                <IonSelectOption
                                    key={section.id}
                                    value={section.id}
                                >
                                    {section.name}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                )}
            />
        </>
    );
}
