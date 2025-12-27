import React, { ComponentProps } from "react";
import { IonItem, IonIcon, IonLabel } from "@ionic/react";
import { construct } from "ionicons/icons";
import { useOpenAIApiKey } from "../../settings/useOpenAIApiKey";

type LLMItemProps = ComponentProps<typeof IonItem> & {
    /** Whether to auto-disable when no API key is configured (default: true) */
    requireApiKey?: boolean;
};

/**
 * Reusable list item for triggering LLM features
 * Distinctive styling: purple border, robot icon, robotic font
 * Automatically disabled if no API key is configured (unless requireApiKey=false)
 */
export const LLMItem: React.FC<LLMItemProps> = ({
    children,
    disabled = false,
    requireApiKey = true,
    style,
    ...props
}) => {
    const { data: apiKey, isLoading } = useOpenAIApiKey();
    const isDisabled =
        disabled || (requireApiKey && (isLoading || !apiKey?.value));

    return (
        <IonItem
            disabled={isDisabled}
            style={{
                "--border-color": "#8b5cf6",
                "--border-width": "2px",
                "--border-style": "solid",
                "--border-radius": "8px",
                "--inner-border-width": "0",
                marginBottom: "8px",
                ...style,
            }}
            {...props}
        >
            <IonIcon
                icon={construct}
                slot="start"
                style={{ color: "#8b5cf6" }}
            />
            {typeof children === "string" ? (
                <IonLabel
                    style={{
                        color: "#8b5cf6",
                        fontFamily: "'Courier New', 'Roboto Mono', monospace",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                    }}
                >
                    {children}
                </IonLabel>
            ) : React.isValidElement(children) && children.type === IonLabel ? (
                React.cloneElement(
                    children as React.ReactElement<
                        ComponentProps<typeof IonLabel>
                    >,
                    {
                        style: {
                            color: "#8b5cf6",
                            fontFamily:
                                "'Courier New', 'Roboto Mono', monospace",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            ...((
                                children as React.ReactElement<
                                    ComponentProps<typeof IonLabel>
                                >
                            ).props.style || {}),
                        },
                    }
                )
            ) : (
                <IonLabel
                    style={{
                        color: "#8b5cf6",
                        fontFamily: "'Courier New', 'Roboto Mono', monospace",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                    }}
                >
                    {children}
                </IonLabel>
            )}
        </IonItem>
    );
};
