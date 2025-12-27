import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonModal,
    IonText,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import { StoreItemEditorProvider } from "./StoreItemEditorProvider";
import { ItemNameAndLocationFields } from "../shared/ItemNameAndLocationFields";
import {
    storeItemEditorSchema,
    StoreItemFormData,
} from "./storeItemEditorSchema";
import { useCreateItem, useUpdateItem } from "../../db/hooks";
import { StoreItem } from "../../db/types";
import { useEffect } from "react";

interface StoreItemEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    editingItem: StoreItem | null;
}

export const StoreItemEditorModal: React.FC<StoreItemEditorModalProps> = ({
    isOpen,
    onClose,
    storeId,
    editingItem,
}) => {
    const createItem = useCreateItem();
    const updateItem = useUpdateItem();

    const form = useForm<StoreItemFormData>({
        resolver: zodResolver(storeItemEditorSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            aisleId: null,
            sectionId: null,
        },
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = form;

    // Reset form when modal opens or editing item changes
    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                reset({
                    name: editingItem.name,
                    aisleId: editingItem.aisle_id,
                    sectionId: editingItem.section_id,
                });
            } else {
                reset({
                    name: "",
                    aisleId: null,
                    sectionId: null,
                });
            }
        }
    }, [isOpen, editingItem, reset]);

    const onSubmit = async (data: StoreItemFormData) => {
        try {
            if (editingItem) {
                await updateItem.mutateAsync({
                    id: editingItem.id,
                    name: data.name,
                    aisleId: data.aisleId ?? null,
                    sectionId: data.sectionId ?? null,
                    storeId: storeId,
                });
            } else {
                await createItem.mutateAsync({
                    storeId,
                    name: data.name,
                    aisleId: data.aisleId ?? null,
                    sectionId: data.sectionId ?? null,
                });
            }
            onClose();
        } catch (error) {
            console.error("Error saving store item:", error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const isPending = createItem.isPending || updateItem.isPending;

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        {editingItem ? "Edit Item" : "Add Item"}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleClose} disabled={isPending}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <StoreItemEditorProvider form={form} storeId={storeId}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ItemNameAndLocationFields
                            control={control}
                            setValue={form.setValue}
                            watch={form.watch}
                            errors={errors}
                            storeId={storeId}
                            disabled={isPending}
                            renderNameField={({ control }) => (
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <IonItem>
                                                <IonLabel position="stacked">
                                                    Item Name
                                                </IonLabel>
                                                <IonInput
                                                    value={field.value}
                                                    placeholder="Enter item name"
                                                    onIonInput={(e) =>
                                                        field.onChange(
                                                            e.detail.value
                                                        )
                                                    }
                                                    disabled={isPending}
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
                                        </>
                                    )}
                                />
                            )}
                        />

                        <IonButton
                            expand="block"
                            type="submit"
                            disabled={!isValid || isPending}
                            style={{ marginTop: "20px" }}
                        >
                            {editingItem ? "Update" : "Add"} Item
                        </IonButton>
                    </form>
                </StoreItemEditorProvider>
            </IonContent>
        </IonModal>
    );
};
