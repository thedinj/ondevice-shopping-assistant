import { IonAlert, IonButton, IonIcon } from "@ionic/react";
import React, { ComponentProps, useState } from "react";
import { useSecureApiKey } from "../../hooks/useSecureStorage";
import { LLM_COLOR, LLM_ICON_SRC } from "./constants";

/**
 * Reusable button for triggering LLM features
 * Distinctive styling: purple border, robot icon, robotic font
 * Shows alert if clicked without API key configured
 */
export const LLMButton: React.FC<ComponentProps<typeof IonButton>> = ({
    children,
    expand = "block",
    style,
    onClick,
    ...props
}) => {
    const apiKeyValue = useSecureApiKey();
    const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLIonButtonElement>) => {
        if (!apiKeyValue) {
            setShowApiKeyAlert(true);
            return;
        }
        onClick?.(e);
    };

    return (
        <>
            <IonButton
                fill="outline"
                expand={expand}
                onClick={handleClick}
                style={{
                    "--border-color": LLM_COLOR,
                    "--border-width": "2px",
                    "--color": LLM_COLOR,
                    letterSpacing: "0.5px",
                    textTransform: "none",
                    ...style,
                }}
                className="llm-button"
                {...props}
            >
                <IonIcon src={LLM_ICON_SRC} slot="start" />
                {children}
            </IonButton>

            <IonAlert
                isOpen={showApiKeyAlert}
                onDidDismiss={() => setShowApiKeyAlert(false)}
                header="API Key Required"
                message="OpenAI API key not configured. Please add it in Settings to use this feature."
                buttons={["OK"]}
            />
        </>
    );
};
