import { useState, forwardRef, useImperativeHandle } from "react";
import {
    IonList,
    IonItem,
    IonLabel,
    IonReorder,
    IonReorderGroup,
    IonSkeletonText,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonAlert,
    IonText,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
} from "@ionic/react";
import { create, trash } from "ionicons/icons";
import { ItemReorderEventDetail } from "@ionic/core";
import {
    useStoreAisles,
    useCreateAisle,
    useUpdateAisle,
    useDeleteAisle,
    useReorderAisles,
} from "../../db/hooks";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ListHandle } from "../../pages/StoreDetail";

const aisleFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .transform((val) => val.trim()),
});

type AisleFormData = z.infer<typeof aisleFormSchema>;

interface AisleListProps {
    storeId: string;
}

const AisleList = forwardRef<ListHandle, AisleListProps>(({ storeId }, ref) => {
    const { data: aisles, isLoading } = useStoreAisles(storeId);
    const createAisle = useCreateAisle();
    const updateAisle = useUpdateAisle();
    const deleteAisle = useDeleteAisle();
    const reorderAisles = useReorderAisles();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAisle, setEditingAisle] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [deleteAlert, setDeleteAlert] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<AisleFormData>({
        resolver: zodResolver(aisleFormSchema),
        mode: "onChange",
    });

    const openCreateModal = () => {
        setEditingAisle(null);
        reset({ name: "" });
        setIsModalOpen(true);
    };

    useImperativeHandle(ref, () => ({
        openCreateModal,
    }));

    const openEditModal = (aisle: { id: string; name: string }) => {
        setEditingAisle(aisle);
        reset({ name: aisle.name });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAisle(null);
        reset({ name: "" });
    };

    const onSubmit = async (data: AisleFormData) => {
        if (editingAisle) {
            await updateAisle.mutateAsync({
                id: editingAisle.id,
                name: data.name,
                storeId,
            });
        } else {
            await createAisle.mutateAsync({ storeId, name: data.name });
        }
        closeModal();
    };

    const confirmDelete = (aisle: { id: string; name: string }) => {
        setDeleteAlert(aisle);
    };

    const handleDelete = async () => {
        if (deleteAlert) {
            await deleteAisle.mutateAsync({ id: deleteAlert.id, storeId });
            setDeleteAlert(null);
        }
    };

    const handleReorder = async (
        event: CustomEvent<ItemReorderEventDetail>
    ) => {
        if (!aisles) return;

        const from = event.detail.from;
        const to = event.detail.to;

        // Create new array with reordered items
        const reordered = [...aisles];
        const [movedItem] = reordered.splice(from, 1);
        reordered.splice(to, 0, movedItem);

        // Update sort_order for affected items
        const updates = reordered.map((aisle, index) => ({
            id: aisle.id,
            sort_order: index,
        }));

        await reorderAisles.mutateAsync({ updates, storeId });

        event.detail.complete();
    };

    if (isLoading) {
        return (
            <IonList>
                {[1, 2, 3].map((i) => (
                    <IonItem key={i}>
                        <IonLabel>
                            <IonSkeletonText
                                animated
                                style={{ width: "60%" }}
                            />
                        </IonLabel>
                    </IonItem>
                ))}
            </IonList>
        );
    }

    if (!aisles || aisles.length === 0) {
        return (
            <div
                style={{
                    textAlign: "center",
                    marginTop: "40px",
                    padding: "20px",
                }}
            >
                <IonText color="medium">
                    <p>No aisles yet. Tap the + button to add one.</p>
                </IonText>
            </div>
        );
    }

    return (
        <>
            <IonList>
                <IonReorderGroup
                    disabled={false}
                    onIonItemReorder={handleReorder}
                >
                    {aisles.map((aisle) => (
                        <IonItemSliding key={aisle.id}>
                            <IonItem>
                                <IonLabel>{aisle.name}</IonLabel>
                                <IonReorder slot="end" />
                            </IonItem>
                            <IonItemOptions side="end">
                                <IonItemOption
                                    color="primary"
                                    onClick={() => openEditModal(aisle)}
                                >
                                    <IonIcon slot="icon-only" icon={create} />
                                </IonItemOption>
                                <IonItemOption
                                    color="danger"
                                    onClick={() => confirmDelete(aisle)}
                                >
                                    <IonIcon slot="icon-only" icon={trash} />
                                </IonItemOption>
                            </IonItemOptions>
                        </IonItemSliding>
                    ))}
                </IonReorderGroup>
            </IonList>

            {/* Aisle Modal */}
            <IonModal isOpen={isModalOpen} onDidDismiss={closeModal}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>
                            {editingAisle ? "Edit Aisle" : "New Aisle"}
                        </IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={closeModal}>Cancel</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Aisle Name
                                    </IonLabel>
                                    <IonInput
                                        {...field}
                                        placeholder="Enter aisle name"
                                        onIonInput={(e) =>
                                            field.onChange(e.detail.value)
                                        }
                                    />
                                </IonItem>
                            )}
                        />
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

                        <IonButton
                            expand="block"
                            type="submit"
                            disabled={
                                !isValid ||
                                createAisle.isPending ||
                                updateAisle.isPending
                            }
                            style={{ marginTop: "20px" }}
                        >
                            {editingAisle ? "Update" : "Create"}
                        </IonButton>
                    </form>
                </IonContent>
            </IonModal>

            {/* Delete Alert */}
            <IonAlert
                isOpen={!!deleteAlert}
                onDidDismiss={() => setDeleteAlert(null)}
                header="Delete Aisle"
                message={`Are you sure you want to delete "${deleteAlert?.name}"? This will also delete all sections in this aisle.`}
                buttons={[
                    {
                        text: "Cancel",
                        role: "cancel",
                    },
                    {
                        text: "Delete",
                        role: "destructive",
                        handler: handleDelete,
                    },
                ]}
            />
        </>
    );
});

export default AisleList;
