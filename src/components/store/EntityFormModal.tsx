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
    IonSelect,
    IonSelectOption,
    IonInput,
    IonText,
} from "@ionic/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStoreManagement } from "./StoreManagementContext";
import {
    useCreateAisle,
    useUpdateAisle,
    useCreateSection,
    useUpdateSection,
} from "../../db/hooks";
import { useEffect } from "react";

const entityFormSchema = z
    .object({
        name: z
            .string()
            .min(1, "Name is required")
            .transform((val) => val.trim()),
        type: z.enum(["aisle", "section"]),
        aisle_id: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.type === "section") {
                return !!data.aisle_id;
            }
            return true;
        },
        {
            message: "Aisle is required for sections",
            path: ["aisle_id"],
        }
    );

type EntityFormData = z.infer<typeof entityFormSchema>;

interface EntityFormModalProps {
    storeId: string;
    aisles: Array<{ id: string; name: string }> | undefined;
}

export const EntityFormModal = ({ storeId, aisles }: EntityFormModalProps) => {
    const { isModalOpen, editingEntity, closeModal } = useStoreManagement();
    const createAisle = useCreateAisle();
    const updateAisle = useUpdateAisle();
    const createSection = useCreateSection();
    const updateSection = useUpdateSection();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid },
    } = useForm<EntityFormData>({
        resolver: zodResolver(entityFormSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            type: "aisle",
            aisle_id: undefined,
        },
    });

    const entityType = watch("type");

    // Reset form when modal opens/closes or editing entity changes
    useEffect(() => {
        if (isModalOpen && editingEntity) {
            reset({
                name: editingEntity.name,
                type: editingEntity.type,
                aisle_id:
                    editingEntity.type === "section"
                        ? editingEntity.aisle_id || undefined
                        : undefined,
            });
        } else if (isModalOpen && !editingEntity) {
            reset({ name: "", type: "aisle", aisle_id: undefined });
        }
    }, [isModalOpen, editingEntity, reset]);

    const onSubmit = async (data: EntityFormData) => {
        if (data.type === "aisle") {
            if (editingEntity) {
                await updateAisle.mutateAsync({
                    id: editingEntity.id,
                    name: data.name,
                    storeId,
                });
            } else {
                await createAisle.mutateAsync({ storeId, name: data.name });
            }
        } else {
            if (!data.aisle_id) {
                throw new Error("Aisle is required for sections");
            }
            if (editingEntity) {
                await updateSection.mutateAsync({
                    id: editingEntity.id,
                    name: data.name,
                    aisleId: data.aisle_id,
                    storeId,
                });
            } else {
                await createSection.mutateAsync({
                    storeId,
                    name: data.name,
                    aisleId: data.aisle_id,
                });
            }
        }
        closeModal();
    };

    const getModalTitle = () => {
        if (editingEntity) {
            return `Edit ${
                editingEntity.type === "aisle" ? "Aisle" : "Section"
            }`;
        }
        return aisles && aisles.length > 0
            ? "New Aisle or Section"
            : "New Aisle";
    };

    const showTypeSelector = !editingEntity && aisles && aisles.length > 0;

    return (
        <IonModal isOpen={isModalOpen} onDidDismiss={closeModal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{getModalTitle()}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={closeModal}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {showTypeSelector && (
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <IonItem>
                                    <IonLabel position="stacked">Type</IonLabel>
                                    <IonSelect
                                        value={field.value}
                                        placeholder="Select type"
                                        onIonChange={(e) =>
                                            field.onChange(e.detail.value)
                                        }
                                    >
                                        <IonSelectOption value="aisle">
                                            Aisle
                                        </IonSelectOption>
                                        <IonSelectOption value="section">
                                            Section
                                        </IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                            )}
                        />
                    )}

                    {entityType === "section" && (
                        <>
                            <Controller
                                name="aisle_id"
                                control={control}
                                render={({ field }) => (
                                    <IonItem>
                                        <IonLabel position="stacked">
                                            Aisle
                                        </IonLabel>
                                        <IonSelect
                                            value={field.value}
                                            placeholder="Select an aisle"
                                            onIonChange={(e) =>
                                                field.onChange(e.detail.value)
                                            }
                                        >
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
                            {errors.aisle_id && (
                                <IonText color="danger">
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            marginLeft: "16px",
                                        }}
                                    >
                                        {errors.aisle_id.message}
                                    </p>
                                </IonText>
                            )}
                        </>
                    )}

                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <IonItem>
                                <IonLabel position="stacked">Name</IonLabel>
                                <IonInput
                                    value={field.value}
                                    placeholder={`Enter ${
                                        entityType === "aisle"
                                            ? "aisle"
                                            : "section"
                                    } name`}
                                    onIonInput={(e) =>
                                        field.onChange(e.detail.value)
                                    }
                                />
                            </IonItem>
                        )}
                    />
                    {errors.name && (
                        <IonText color="danger">
                            <p style={{ fontSize: "12px", marginLeft: "16px" }}>
                                {errors.name.message}
                            </p>
                        </IonText>
                    )}

                    <IonButton
                        expand="block"
                        type="submit"
                        disabled={
                            !isValid ||
                            createAisle.isPending ||
                            updateAisle.isPending ||
                            createSection.isPending ||
                            updateSection.isPending
                        }
                        style={{ marginTop: "20px" }}
                    >
                        {editingEntity ? "Update" : "Create"}
                    </IonButton>
                </form>
            </IonContent>
        </IonModal>
    );
};
