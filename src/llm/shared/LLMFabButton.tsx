import React, { ComponentProps, useState } from "react";
import { IonFabButton, IonIcon, IonAlert } from "@ionic/react";
import { useOpenAIApiKey } from "../../settings/useOpenAIApiKey";
import { LLM_ICON, LLM_COLOR, LLM_COLOR_ACTIVATED } from "./constants";

/**
 * FAB button for LLM features with distinctive styling
 * Shows alert if clicked without API key configured
 */
export const LLMFabButton: React.FC<ComponentProps<typeof IonFabButton>> = ({
    disabled = false,
    onClick,
    ...props
}) => {
    const { data: apiKey, isLoading } = useOpenAIApiKey();
    const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
    const isDisabled = disabled || isLoading;

    const handleClick = (e: React.MouseEvent<HTMLIonFabButtonElement>) => {
        if (!apiKey?.value) {
            setShowApiKeyAlert(true);
            return;
        }
        onClick?.(e);
    };

    return (
        <>
            <IonFabButton
                disabled={isDisabled}
                onClick={handleClick}
                style={{
                    "--background": LLM_COLOR,
                    "--background-activated": LLM_COLOR_ACTIVATED,
                    "--background-hover": LLM_COLOR_ACTIVATED,
                }}
                {...props}
            >
                <IonIcon icon={LLM_ICON} />
            </IonFabButton>

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
