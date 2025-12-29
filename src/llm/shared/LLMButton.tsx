import React, { ComponentProps, useState } from "react";
import { IonButton, IonIcon, IonAlert } from "@ionic/react";
import { useOpenAIApiKey } from "../../settings/useOpenAIApiKey";
import { LLM_ICON_SRC } from "./constants";

/**
 * Reusable button for triggering LLM features
 * Distinctive styling: purple border, robot icon, robotic font
 * Shows alert if clicked without API key configured
 */
export const LLMButton: React.FC<ComponentProps<typeof IonButton>> = ({
    children,
    disabled = false,
    expand = "block",
    style,
    onClick,
    ...props
}) => {
    const { data: apiKey, isLoading } = useOpenAIApiKey();
    const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
    const isDisabled = disabled || isLoading;

    const handleClick = (e: React.MouseEvent<HTMLIonButtonElement>) => {
        if (!apiKey?.value) {
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
                disabled={isDisabled}
                onClick={handleClick}
                style={{
                    "--border-color": "#8b5cf6",
                    "--border-width": "2px",
                    "--color": "#8b5cf6",
                    fontFamily: "'Courier New', 'Roboto Mono', monospace",
                    fontWeight: 600,
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
