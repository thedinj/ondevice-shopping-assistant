import { zodResolver } from "@hookform/resolvers/zod";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonPage,
    IonSkeletonText,
    IonText,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { add, closeOutline, storefrontOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { z } from "zod";
import { FabSpacer } from "../components/shared/FabSpacer";
import { useCreateStore, useStores, useUpdateStore } from "../db/hooks";
import { useLastSelectedStore } from "../hooks/useLastSelectedStore";

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
    const { lastStoreId, saveLastStore } = useLastSelectedStore();
    const history = useHistory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<{
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

    // Auto-navigate to last selected store on mount
    useEffect(() => {
        if (!isLoading && lastStoreId && stores) {
            const exists = stores.some((s) => s.id === lastStoreId);
            if (exists) {
                // Navigate to the last selected store
                history.push(`/stores/${lastStoreId}`);
            } else {
                // Last store was deleted, clear preference
                saveLastStore(null);
            }
        }
    }, [isLoading, lastStoreId, stores, history, saveLastStore]);

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
                            <p>
                                No stores configured. Add one to begin
                                optimizing your shopping.
                            </p>
                        </IonText>
                    </div>
                ) : (
                    <IonList>
                        {stores.map((store) => (
                            <IonItem
                                key={store.id}
                                routerLink={`/stores/${store.id}`}
                                button
                                detail
                                onClick={() => saveLastStore(store.id)}
                            >
                                <IonIcon
                                    icon={storefrontOutline}
                                    slot="start"
                                />
                                <IonLabel>
                                    <h2>{store.name}</h2>
                                </IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                )}
                <FabSpacer />

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
                                    <IonIcon icon={closeOutline} />
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
                                            autocapitalize="sentences"
                                            onIonInput={(e) =>
                                                field.onChange(e.detail.value)
                                            }
                                            autoCapitalize="sentences"
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
            </IonContent>
        </IonPage>
    );
};

export default StoresList;
