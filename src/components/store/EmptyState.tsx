import { IonText } from "@ionic/react";

export const EmptyState = () => {
    return (
        <div
            style={{
                textAlign: "center",
                marginTop: "40px",
                padding: "20px",
            }}
        >
            <IonText color="medium">
                <p>No aisles or sections yet. Tap the + button to add one.</p>
            </IonText>
        </div>
    );
};
