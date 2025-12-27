import { zodResolver } from "@hookform/resolvers/zod";
import {
    IonAlert,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonModal,
    IonPage,
    IonSkeletonText,
    IonText,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { add, create, trash } from "ionicons/icons";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
    useCreateStore,
    useDeleteStore,
    useStores,
    useUpdateStore,
} from "../db/hooks";

const storeFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .transform((val) => val.trim()),
});

type StoreFormData = z.infer<typeof storeFormSchema>;

const StoresList: React.FC = () => {
    const { data: stores, isLoading } = useStores();
    const createStore = useCreateStore();
    const updateStore = useUpdateStore();
    const deleteStore = useDeleteStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<{
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
    } = useForm<StoreFormData>({
        resolver: zodResolver(storeFormSchema),
        mode: "onChange",
    });

    const openCreateModal = () => {
        setEditingStore(null);
        reset({ name: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (store: { id: string; name: string }) => {
        setEditingStore(store);
        reset({ name: store.name });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStore(null);
        reset({ name: "" });
    };

    const onSubmit = async (data: StoreFormData) => {
        if (editingStore) {
            await updateStore.mutateAsync({
                id: editingStore.id,
                name: data.name,
            });
        } else {
            await createStore.mutateAsync(data.name);
        }
        closeModal();
    };

    const confirmDelete = (store: { id: string; name: string }) => {
        setDeleteAlert(store);
    };

    const handleDelete = async () => {
        if (deleteAlert) {
            await deleteStore.mutateAsync(deleteAlert.id);
            setDeleteAlert(null);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Stores</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Stores</IonTitle>
                    </IonToolbar>
                </IonHeader>

                {isLoading ? (
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
                ) : !stores?.length ? (
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "40px",
                            padding: "20px",
                        }}
                    >
                        <IonText color="medium">
                            <p>No stores yet. Tap the + button to add one.</p>
                        </IonText>
                    </div>
                ) : (
                    <IonList>
                        {stores.map((store) => (
                            <IonItemSliding key={store.id}>
                                <IonItem
                                    routerLink={`/stores/${store.id}`}
                                    button
                                >
                                    <IonLabel>{store.name}</IonLabel>
                                </IonItem>
                                <IonItemOptions side="end">
                                    <IonItemOption
                                        color="primary"
                                        onClick={() => openEditModal(store)}
                                    >
                                        <IonIcon
                                            slot="icon-only"
                                            icon={create}
                                        />
                                    </IonItemOption>
                                    <IonItemOption
                                        color="danger"
                                        onClick={() => confirmDelete(store)}
                                    >
                                        <IonIcon
                                            slot="icon-only"
                                            icon={trash}
                                        />
                                    </IonItemOption>
                                </IonItemOptions>
                            </IonItemSliding>
                        ))}
                    </IonList>
                )}

                <IonFab slot="fixed" vertical="bottom" horizontal="end">
                    <IonFabButton onClick={openCreateModal}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                {/* Store Name Modal */}
                <IonModal isOpen={isModalOpen} onDidDismiss={closeModal}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>
                                {editingStore ? "Edit Store" : "New Store"}
                            </IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={closeModal}>
                                    Cancel
                                </IonButton>
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
                                            Store Name
                                        </IonLabel>
                                        <IonInput
                                            {...field}
                                            placeholder="Enter store name"
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
                                    createStore.isPending ||
                                    updateStore.isPending
                                }
                                style={{ marginTop: "20px" }}
                            >
                                {editingStore ? "Update" : "Create"}
                            </IonButton>
                        </form>
                    </IonContent>
                </IonModal>

                {/* Delete Confirmation Alert */}
                <IonAlert
                    isOpen={!!deleteAlert}
                    onDidDismiss={() => setDeleteAlert(null)}
                    header="Delete Store"
                    message={`Are you sure you want to delete "${deleteAlert?.name}"? This will also delete all aisles, sections, and items for this store.`}
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
            </IonContent>
        </IonPage>
    );
};

export default StoresList;
