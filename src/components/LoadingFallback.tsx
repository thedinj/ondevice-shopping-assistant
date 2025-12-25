import { IonSpinner, IonText } from "@ionic/react";
import "./LoadingFallback.css";

const LoadingFallback: React.FC = () => {
    return (
        <div className="loading-fallback">
            <IonSpinner name="crescent" color="primary" />
            <IonText color="medium">
                <p>Loading...</p>
            </IonText>
        </div>
    );
};

export default LoadingFallback;
