import { useEffect, useState } from "react";
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonList,
    IonText,
    IonTextarea,
} from "@ionic/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDebounce } from "use-debounce";
import { useShoppingListContext } from "./useShoppingListContext";
import {
    useUpsertShoppingListItem,
    useStoreAisles,
    useStoreSections,
    useStoreItemAutocomplete,
} from "../../db/hooks";

const itemFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .transform((val) => val.trim()),
    qty: z.number().min(1, "Quantity must be at least 1"),
    notes: z.string().nullable().optional(),
    aisleId: z.string().nullable().optional(),
    sectionId: z.string().nullable().optional(),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemEditorModalProps {
    listId: string;
    storeId: string;
}

export const ItemEditorModal = ({ listId, storeId }: ItemEditorModalProps) => {
    const { isItemModalOpen, editingItem, closeItemModal } =
        useShoppingListContext();
    const upsertItem = useUpsertShoppingListItem();
    const { data: aisles } = useStoreAisles(storeId);
    const { data: sections } = useStoreSections(storeId);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 300);
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    const { data: autocompleteResults } = useStoreItemAutocomplete(
        storeId,
        debouncedSearch
    );

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isValid },
    } = useForm<ItemFormData>({
        resolver: zodResolver(itemFormSchema),
        mode: "onSubmit",
        defaultValues: {
            name: "",
            qty: 1,
            notes: null,
            aisleId: null,
            sectionId: null,
        },
    });

    // Reset form when modal opens/closes or editing item changes
    useEffect(() => {
        if (isItemModalOpen && editingItem) {
            reset({
                name: editingItem.name,
                qty: editingItem.qty,
                notes: editingItem.notes,
                aisleId: editingItem.aisle_id,
                sectionId: editingItem.section_id,
            });
            setSearchTerm(editingItem.name);
        } else if (isItemModalOpen) {
            reset({
                name: "",
                qty: 1,
                notes: null,
                aisleId: null,
                sectionId: null,
            });
            setSearchTerm("");
        }
    }, [isItemModalOpen, editingItem, reset]);

    const onSubmit = async (data: ItemFormData) => {
        await upsertItem.mutateAsync({
            id: editingItem?.id,
            listId,
            storeId,
            name: data.name,
            qty: data.qty,
            notes: data.notes || null,
            aisleId: data.aisleId || null,
            sectionId: data.sectionId || null,
        });
        closeItemModal();
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setValue("name", value);
        setShowAutocomplete(value.length >= 3);
    };

    const handleAutocompleteSelect = (item: {
        id: string;
        name: string;
        section_id: string | null;
    }) => {
        setValue("name", item.name);
        setValue("sectionId", item.section_id);

        // Find aisle for the selected section
        if (item.section_id && sections) {
            const section = sections.find((s) => s.id === item.section_id);
            if (section) {
                setValue("aisleId", section.aisle_id);
            }
        }

        setSearchTerm(item.name);
        setShowAutocomplete(false);
    };

    // Filter sections by selected aisle
    const filteredSections = sections?.filter(
        (section) =>
            !control._formValues.aisleId ||
            section.aisle_id === control._formValues.aisleId
    );

    return (
        <IonModal isOpen={isItemModalOpen} onDidDismiss={closeItemModal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        {editingItem ? "Edit Item" : "Add Item"}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={closeItemModal}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Name field with autocomplete */}
                    <Controller
                        name="name"
                        control={control}
                        render={() => (
                            <div style={{ position: "relative" }}>
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Item Name
                                    </IonLabel>
                                    <IonInput
                                        value={searchTerm}
                                        placeholder="Enter item name"
                                        onIonInput={(e) =>
                                            handleSearchChange(
                                                e.detail.value || ""
                                            )
                                        }
                                        onIonFocus={() =>
                                            setShowAutocomplete(
                                                searchTerm.length >= 2
                                            )
                                        }
                                    />
                                </IonItem>
                                {errors.name && (
                                    <IonText color="danger">
                                        <p
                                            style={{
                                                fontSize: "12px",
                                                marginLeft: "16px",
                                            }}
                                        >
                                            {errors.name.message}
                                        </p>
                                    </IonText>
                                )}

                                {/* Autocomplete dropdown */}
                                {showAutocomplete &&
                                    autocompleteResults &&
                                    autocompleteResults.length > 0 && (
                                        <IonList
                                            style={{
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                right: 0,
                                                zIndex: 1000,
                                                maxHeight: "200px",
                                                overflow: "auto",
                                                border: "1px solid var(--ion-color-medium)",
                                                borderRadius: "4px",
                                                backgroundColor:
                                                    "var(--ion-background-color)",
                                            }}
                                        >
                                            {autocompleteResults.map((item) => {
                                                const section = sections?.find(
                                                    (s) =>
                                                        s.id === item.section_id
                                                );
                                                const aisle = aisles?.find(
                                                    (a) =>
                                                        a.id ===
                                                        section?.aisle_id
                                                );
                                                return (
                                                    <IonItem
                                                        key={item.id}
                                                        button
                                                        onClick={() =>
                                                            handleAutocompleteSelect(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        <IonLabel>
                                                            <h3>{item.name}</h3>
                                                            {(aisle ||
                                                                section) && (
                                                                <p>
                                                                    {
                                                                        aisle?.name
                                                                    }
                                                                    {aisle &&
                                                                        section &&
                                                                        " • "}
                                                                    {
                                                                        section?.name
                                                                    }
                                                                </p>
                                                            )}
                                                        </IonLabel>
                                                    </IonItem>
                                                );
                                            })}
                                        </IonList>
                                    )}
                            </div>
                        )}
                    />

                    {/* Quantity */}
                    <Controller
                        name="qty"
                        control={control}
                        render={({ field }) => (
                            <IonItem>
                                <IonLabel position="stacked">Quantity</IonLabel>
                                <IonInput
                                    value={field.value}
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    onIonInput={(e) => {
                                        const val = e.detail.value;
                                        field.onChange(val ? Number(val) : 1);
                                    }}
                                />
                            </IonItem>
                        )}
                    />
                    {errors.qty && (
                        <IonText color="danger">
                            <p
                                style={{
                                    fontSize: "12px",
                                    marginLeft: "16px",
                                }}
                            >
                                {errors.qty.message}
                            </p>
                        </IonText>
                    )}

                    {/* Aisle */}
                    <Controller
                        name="aisleId"
                        control={control}
                        render={({ field }) => (
                            <IonItem>
                                <IonLabel position="stacked">
                                    Aisle (Optional)
                                </IonLabel>
                                <IonSelect
                                    value={field.value ?? undefined}
                                    placeholder="Select an aisle"
                                    onIonChange={(e) => {
                                        field.onChange(e.detail.value ?? null);
                                        // Clear section if aisle changed
                                        if (control._formValues.sectionId) {
                                            const section = sections?.find(
                                                (s) =>
                                                    s.id ===
                                                    control._formValues
                                                        .sectionId
                                            );
                                            if (
                                                section &&
                                                section.aisle_id !==
                                                    e.detail.value
                                            ) {
                                                setValue("sectionId", null);
                                            }
                                        }
                                    }}
                                >
                                    <IonSelectOption value={undefined}>
                                        None
                                    </IonSelectOption>
                                    {aisles?.map((aisle) => (
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
                                <IonLabel position="stacked">
                                    Section (Optional)
                                </IonLabel>
                                <IonSelect
                                    value={field.value ?? undefined}
                                    placeholder="Select a section"
                                    onIonChange={(e) =>
                                        field.onChange(e.detail.value ?? null)
                                    }
                                    disabled={!filteredSections?.length}
                                >
                                    <IonSelectOption value={undefined}>
                                        None
                                    </IonSelectOption>
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

                    {/* Notes */}
                    <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                            <IonItem>
                                <IonLabel position="stacked">
                                    Notes (Optional)
                                </IonLabel>
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

                    <IonButton
                        expand="block"
                        type="submit"
                        disabled={!isValid || upsertItem.isPending}
                        style={{ marginTop: "20px" }}
                    >
                        {editingItem ? "Update" : "Add"}
                    </IonButton>
                </form>
            </IonContent>
        </IonModal>
    );
};
