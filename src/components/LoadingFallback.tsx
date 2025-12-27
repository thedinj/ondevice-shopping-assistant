import { IonText } from "@ionic/react";
import "./LoadingFallback.css";

const LoadingFallback: React.FC = () => {
    return (
        <div className="loading-fallback">
            <div className="robot-head">
                <div className="robot-antenna"></div>
                <div className="robot-head-body">
                    <div className="robot-eyes">
                        <div className="robot-eye"></div>
                        <div className="robot-eye"></div>
                    </div>
                    <div className="robot-mouth"></div>
                    <div className="robot-gear robot-gear-left"></div>
                    <div className="robot-gear robot-gear-right"></div>
                </div>
            </div>
            <IonText color="medium">
                <p>Processing... Even you must wait.</p>
            </IonText>
        </div>
    );
};

export default LoadingFallback;
