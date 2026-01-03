import {
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
} from "@ionic/react";
import { settings } from "ionicons/icons";
import { useAppHeader } from "./useAppHeader";

export const AppMenu: React.FC = () => {
    const { customMenuItems, openSettings } = useAppHeader();

    return (
        <IonMenu contentId="main-content" type="overlay">
            <IonContent>
                <IonList>
                    {/* Custom menu items from pages */}
                    {customMenuItems.map((item) => (
                        <IonMenuToggle key={item.id} autoHide={false}>
                            <IonItem
                                button
                                onClick={item.onClick}
                                lines="none"
                            >
                                <IonIcon
                                    icon={item.icon}
                                    slot="start"
                                    color={item.color}
                                />
                                <IonLabel color={item.color}>
                                    {item.label}
                                </IonLabel>
                            </IonItem>
                        </IonMenuToggle>
                    ))}

                    {/* Separator if there are custom items */}
                    {customMenuItems.length > 0 && (
                        <div
                            style={{
                                height: "1px",
                                background: "var(--ion-color-light)",
                                margin: "8px 0",
                            }}
                        />
                    )}

                    {/* Settings button */}
                    <IonMenuToggle autoHide={false}>
                        <IonItem button onClick={openSettings} lines="none">
                            <IonIcon icon={settings} slot="start" />
                            <IonLabel>Settings</IonLabel>
                        </IonItem>
                    </IonMenuToggle>
                </IonList>
            </IonContent>
        </IonMenu>
    );
};
