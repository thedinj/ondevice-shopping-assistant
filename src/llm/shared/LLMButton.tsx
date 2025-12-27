import React, { ComponentProps } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { construct } from "ionicons/icons";
import { useOpenAIApiKey } from "../../settings/useOpenAIApiKey";

/**
 * Reusable button for triggering LLM features
 * Distinctive styling: purple border, robot icon, robotic font
 * Automatically disabled if no API key is configured
 */
export const LLMButton: React.FC<ComponentProps<typeof IonButton>> = ({
    children,
    disabled = false,
    expand = "block",
    style,
    ...props
}) => {
    const { data: apiKey, isLoading } = useOpenAIApiKey();
    const isDisabled = disabled || isLoading || !apiKey?.value;

    return (
        <IonButton
            fill="outline"
            expand={expand}
            disabled={isDisabled}
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
            <IonIcon icon={construct} slot="start" />
            {children}
        </IonButton>
    );
};
