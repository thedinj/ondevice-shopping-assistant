import { zodResolver } from "@hookform/resolvers/zod";
import {
    IonAlert,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
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
import { create, gridOutline, listOutline, trash } from "ionicons/icons";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { z } from "zod";
import { useDeleteStore, useStore, useUpdateStore } from "../db/hooks";

const storeFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .transform((val) => val.trim()),
});

type StoreFormData = z.infer<typeof storeFormSchema>;

const StoreDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const { data: store, isLoading } = useStore(id);
    const updateStore = useUpdateStore();
    const deleteStore = useDeleteStore();
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<StoreFormData>({
        resolver: zodResolver(storeFormSchema),
        mode: "onChange",
    });

    const openRenameModal = () => {
        if (store) {
            reset({ name: store.name });
            setIsRenameModalOpen(true);
        }
    };

    const closeRenameModal = () => {
        setIsRenameModalOpen(false);
        reset({ name: "" });
    };

    const onSubmitRename = async (data: StoreFormData) => {
        await updateStore.mutateAsync({ id, name: data.name });
        closeRenameModal();
    };

    const handleDelete = async () => {
        await deleteStore.mutateAsync(id);
        setShowDeleteAlert(false);
        history.replace("/stores");
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/stores" />
                    </IonButtons>
                    <IonTitle>
                        {isLoading ? (
                            <IonSkeletonText
                                animated
                                style={{ width: "120px" }}
                            />
                        ) : (
                            store?.name || "Store"
                        )}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton
                            onClick={openRenameModal}
                            disabled={isLoading}
                        >
                            <IonIcon slot="icon-only" icon={create} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonList>
                    <IonItem
                        button
                        detail={true}
                        onClick={() => history.push(`/stores/${id}/aisles`)}
                    >
                        <IonIcon icon={gridOutline} slot="start" />
                        <IonLabel>
                            <h2>Edit Aisles/Sections</h2>
                            <p>Organize store layout</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem
                        button
                        detail={true}
                        onClick={() => history.push(`/stores/${id}/items`)}
                    >
                        <IonIcon icon={listOutline} slot="start" />
                        <IonLabel>
                            <h2>Edit Store Items</h2>
                            <p>Manage products and their locations</p>
                        </IonLabel>
                    </IonItem>
                </IonList>

                <div className="ion-padding">
                    <IonButton
                        expand="block"
                        color="danger"
                        fill="outline"
                        onClick={() => setShowDeleteAlert(true)}
                        disabled={isLoading || deleteStore.isPending}
                    >
                        <IonIcon slot="start" icon={trash} />
                        Delete Store
                    </IonButton>
                </div>

                {/* Rename Store Modal */}
                <IonModal
                    isOpen={isRenameModalOpen}
                    onDidDismiss={closeRenameModal}
                >
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Rename Store</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={closeRenameModal}>
                                    Cancel
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <form onSubmit={handleSubmit(onSubmitRename)}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <IonItem>
                                        <IonLabel position="stacked">
                                            Store Name
                                        </IonLabel>
                                        <IonInput
                                            value={field.value}
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
                                disabled={!isValid || updateStore.isPending}
                                style={{ marginTop: "20px" }}
                            >
                                Update
                            </IonButton>
                        </form>
                    </IonContent>
                </IonModal>

                {/* Delete Confirmation Alert */}
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Delete Store"
                    message={`Are you sure you want to delete "${store?.name}"? This will also delete all aisles, sections, and items for this store.`}
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

export default StoreDetail;
