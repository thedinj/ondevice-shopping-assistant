import { useState } from "react";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
    IonSkeletonText,
    IonButton,
    IonModal,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    IonList,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import {
    create,
    listOutline,
    gridOutline,
    chevronForward,
} from "ionicons/icons";
import { useStore, useUpdateStore } from "../db/hooks";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

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
                        <IonIcon icon={chevronForward} slot="end" />
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
                        <IonIcon icon={chevronForward} slot="end" />
                    </IonItem>
                </IonList>

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
            </IonContent>
        </IonPage>
    );
};

export default StoreDetail;
