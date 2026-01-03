import {
    IonBackButton,
    IonButtons,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar,
} from "@ionic/react";

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
                {children}
            </IonToolbar>
        </IonHeader>
    );
};
