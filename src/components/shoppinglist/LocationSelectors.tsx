import { useMemo } from "react";
import { IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/react";
import { Controller } from "react-hook-form";
import { useItemEditorContext } from "./useItemEditorContext";

export const LocationSelectors = () => {
    const { control, setValue, watch, aisles, sections } =
        useItemEditorContext();

    const currentAisleId = watch("aisleId");
    const currentSectionId = watch("sectionId");

    // Filter and sort sections by selected aisle, then alphabetically
    const filteredSections = useMemo(() => {
        return sections
            ?.filter(
                (section) =>
                    !currentAisleId || section.aisle_id === currentAisleId
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [sections, currentAisleId]);

    // Sort aisles alphabetically
    const sortedAisles = useMemo(() => {
        return aisles?.slice().sort((a, b) => a.name.localeCompare(b.name));
    }, [aisles]);

    return (
        <>
            {/* Aisle */}
            <Controller
                name="aisleId"
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
                                        (s) => s.id === currentSectionId
                                    );
                                    if (section && section.aisle_id !== value) {
                                        setValue("sectionId", null);
                                    }
                                }
                            }}
                        >
                            <IonSelectOption value="">None</IonSelectOption>
                            {sortedAisles?.map((aisle) => (
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
                name="sectionId"
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
                                        (s) => s.id === value
                                    );
                                    if (section) {
                                        setValue("aisleId", section.aisle_id);
                                    }
                                }
                            }}
                            disabled={!filteredSections?.length}
                        >
                            <IonSelectOption value="">None</IonSelectOption>
                            {filteredSections?.map((section) => (
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
};
