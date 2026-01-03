import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenuButton,
    IonPopover,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { ellipsisVertical } from "ionicons/icons";
import { useState } from "react";
import { useAppHeader } from "./useAppHeader";

interface AppHeaderProps {
    title: string | React.ReactNode;
    showBackButton?: boolean;
    backButtonHref?: string;
    children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBackButton = false,
    backButtonHref,
    children,
}) => {
    const { pageMenuItems } = useAppHeader();
    const [showPageMenu, setShowPageMenu] = useState(false);

    return (
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonMenuButton />
                    {showBackButton && (
                        <IonBackButton defaultHref={backButtonHref} />
                    )}
                </IonButtons>
                <IonTitle>{title}</IonTitle>
                <IonButtons slot="end">
                    {children}
                    {pageMenuItems.length > 0 && (
                        <>
                            <IonButton
                                id="page-menu-trigger"
                                onClick={() => setShowPageMenu(true)}
                            >
                                <IonIcon
                                    slot="icon-only"
                                    icon={ellipsisVertical}
                                />
                            </IonButton>
                            <IonPopover
                                trigger="page-menu-trigger"
                                isOpen={showPageMenu}
                                onDidDismiss={() => setShowPageMenu(false)}
                                side="bottom"
                                alignment="end"
                            >
                                <IonList>
                                    {pageMenuItems.map((item) => (
                                        <IonItem
                                            key={item.id}
                                            button
                                            onClick={() => {
                                                item.onClick();
                                                setShowPageMenu(false);
                                            }}
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
                                    ))}
                                </IonList>
                            </IonPopover>
                        </>
                    )}
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    );
};
