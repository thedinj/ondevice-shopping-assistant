import { IonAlert, IonItem, IonLabel } from "@ionic/react";
import { useMemo, useState } from "react";
import {
    Control,
    Controller,
    FieldValues,
    Path,
    PathValue,
    UseFormSetValue,
    UseFormWatch,
} from "react-hook-form";
import { useStoreAisles, useStoreSections } from "../../db/hooks";
import { useToast } from "../../hooks/useToast";
import { useAutoCategorize } from "../../llm/features/useAutoCategorize";
import { LLMButton } from "../../llm/shared";
import { StoreAisle, StoreSection } from "../../models/Store";
import {
    ClickableSelectionModal,
    SelectableItem,
} from "./ClickableSelectionModal";

interface LocationSelectorsProps<T extends FieldValues = FieldValues> {
    control: Control<T>;
    setValue: UseFormSetValue<T>;
    watch: UseFormWatch<T>;
    storeId: string;
    disabled?: boolean;
    itemName?: string;
}

export function LocationSelectors<T extends FieldValues = FieldValues>({
    control,
    setValue,
    watch,
    storeId,
    disabled = false,
    itemName,
}: LocationSelectorsProps<T>) {
    const { data: aisles } = useStoreAisles(storeId);
    const { data: sections } = useStoreSections(storeId);

    const [isAisleModalOpen, setIsAisleModalOpen] = useState(false);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
    const [showOverrideAlert, setShowOverrideAlert] = useState(false);

    const { showError, showSuccess } = useToast();
    const autoCategorize = useAutoCategorize();

    const currentAisleId = watch("aisleId" as Path<T>);
    const currentSectionId = watch("sectionId" as Path<T>);

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

    // Convert to SelectableItem format
    const aisleItems: SelectableItem[] = useMemo(() => {
        return (
            sortedAisles?.map((aisle) => ({
                id: aisle.id,
                label: aisle.name,
            })) || []
        );
    }, [sortedAisles]);

    const sectionItems: SelectableItem[] = useMemo(() => {
        return (
            filteredSections?.map((section) => ({
                id: section.id,
                label: section.name,
            })) || []
        );
    }, [filteredSections]);

    // Get display names
    const selectedAisleName = sortedAisles?.find(
        (a) => a.id === currentAisleId
    )?.name;
    const selectedSectionName = filteredSections?.find(
        (s) => s.id === currentSectionId
    )?.name;

    const handleAutoCategorize = async (force = false) => {
        if (!itemName?.trim()) {
            showError("Please enter an item name first");
            return;
        }

        // Check if values already exist and we're not forcing
        if (!force && (currentAisleId || currentSectionId)) {
            setShowOverrideAlert(true);
            return;
        }

        setIsAutoCategorizing(true);

        try {
            const result = await autoCategorize({
                itemName,
                aisles:
                    sortedAisles?.map((aisle) => ({
                        id: aisle.id,
                        name: aisle.name,
                        sections:
                            sections
                                ?.filter((s) => s.aisle_id === aisle.id)
                                .map((s) => ({ id: s.id, name: s.name })) || [],
                    })) || [],
            });

            // Apply categorization
            setValue(
                "aisleId" as Path<T>,
                result.aisleId as PathValue<T, Path<T>>
            );
            if (result.sectionId) {
                setValue(
                    "sectionId" as Path<T>,
                    result.sectionId as PathValue<T, Path<T>>
                );
            }

            showSuccess(
                `Auto-categorized to ${result.aisleName}${
                    result.sectionName ? ` • ${result.sectionName}` : ""
                }`
            );
        } catch (error) {
            showError(
                error instanceof Error
                    ? error.message
                    : "Auto-categorize failed"
            );
        } finally {
            setIsAutoCategorizing(false);
        }
    };

    return (
        <>
            {/* Auto-Categorize Button */}
            {itemName && sortedAisles && sortedAisles.length > 0 && (
                <LLMButton
                    expand="block"
                    onClick={() => handleAutoCategorize()}
                    disabled={disabled || isAutoCategorizing}
                    style={{ margin: 0 }}
                >
                    {isAutoCategorizing ? "Locating..." : "Auto-Locate"}
                </LLMButton>
            )}

            {/* Override Alert */}
            <IonAlert
                isOpen={showOverrideAlert}
                onDidDismiss={() => setShowOverrideAlert(false)}
                header="Override Location?"
                message="This item already has an aisle/section selected. Do you want to override it with the AI suggestion?"
                buttons={[
                    {
                        text: "Cancel",
                        role: "cancel",
                    },
                    {
                        text: "Override",
                        handler: () => handleAutoCategorize(true),
                    },
                ]}
            />

            {/* Aisle */}
            <Controller
                name={"aisleId" as Path<T>}
                control={control}
                render={({ field }) => (
                    <>
                        <IonItem
                            button
                            onClick={() =>
                                !disabled &&
                                aisleItems.length > 0 &&
                                setIsAisleModalOpen(true)
                            }
                            disabled={disabled || aisleItems.length === 0}
                        >
                            <IonLabel position="stacked">Aisle</IonLabel>
                            <div
                                style={{
                                    color: field.value
                                        ? "var(--ion-color-dark)"
                                        : "var(--ion-color-medium)",
                                }}
                            >
                                {field.value ? selectedAisleName : "None"}
                            </div>
                        </IonItem>

                        <ClickableSelectionModal
                            items={aisleItems}
                            value={field.value || undefined}
                            onSelect={(aisleId) => {
                                field.onChange(aisleId);
                                // Clear section if aisle changed and section doesn't belong to new aisle
                                if (currentSectionId) {
                                    const section = sections?.find(
                                        (s: StoreSection) =>
                                            s.id === currentSectionId
                                    );
                                    if (
                                        section &&
                                        section.aisle_id !== aisleId
                                    ) {
                                        setValue(
                                            "sectionId" as Path<T>,
                                            null as PathValue<T, Path<T>>
                                        );
                                    }
                                }
                            }}
                            isOpen={isAisleModalOpen}
                            onDismiss={() => setIsAisleModalOpen(false)}
                            title="Select Aisle"
                            searchPlaceholder="Search aisles..."
                            showSearch={true}
                        />
                    </>
                )}
            />

            {/* Section */}
            <Controller
                name={"sectionId" as Path<T>}
                control={control}
                render={({ field }) => (
                    <>
                        <IonItem
                            button
                            onClick={() =>
                                !disabled &&
                                sectionItems.length > 0 &&
                                setIsSectionModalOpen(true)
                            }
                            disabled={disabled || sectionItems.length === 0}
                        >
                            <IonLabel position="stacked">Section</IonLabel>
                            <div
                                style={{
                                    color: field.value
                                        ? "var(--ion-color-dark)"
                                        : "var(--ion-color-medium)",
                                }}
                            >
                                {field.value ? selectedSectionName : "None"}
                            </div>
                        </IonItem>

                        <ClickableSelectionModal
                            items={sectionItems}
                            value={field.value || undefined}
                            onSelect={(sectionId) => {
                                field.onChange(sectionId);
                                // If a section is selected, automatically set its aisle
                                if (sectionId && sections) {
                                    const section = sections.find(
                                        (s: StoreSection) => s.id === sectionId
                                    );
                                    if (section) {
                                        setValue(
                                            "aisleId" as Path<T>,
                                            section.aisle_id as PathValue<
                                                T,
                                                Path<T>
                                            >
                                        );
                                    }
                                }
                            }}
                            isOpen={isSectionModalOpen}
                            onDismiss={() => setIsSectionModalOpen(false)}
                            title="Select Section"
                            searchPlaceholder="Search sections..."
                            showSearch={true}
                        />
                    </>
                )}
            />
        </>
    );
}
