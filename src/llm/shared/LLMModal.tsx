import React, { useState, useRef } from "react";
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonText,
    IonSkeletonText,
    IonItem,
    IonLabel,
    IonIcon,
    IonList,
    IonChip,
    IonTextarea,
} from "@ionic/react";
import { close, attach, camera } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { useLLMModalContext } from "./useLLMModalContext";
import { useToast } from "../../hooks/useToast";
import { useOpenAIApiKey } from "../../settings/useOpenAIApiKey";
import { OpenAIClient } from "./openaiClient";
import type { LLMAttachment } from "./types";

/**
 * Modal for running LLM API calls with file attachments
 */
export const LLMModal: React.FC = () => {
    const { isOpen, config, closeModal, response, setResponse } =
        useLLMModalContext();
    const { showError } = useToast();
    const { data: apiKey, isLoading: isLoadingApiKey } = useOpenAIApiKey();

    const [isLoading, setIsLoading] = useState(false);
    const [attachments, setAttachments] = useState<LLMAttachment[]>([]);
    const [userText, setUserText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        if (isLoading) return; // Prevent closing during API call

        if (config?.onCancel) {
            config.onCancel();
        }

        // Reset state
        setAttachments([]);
        setUserText("");
        closeModal();
    };

    const handleAccept = () => {
        if (!response || !config) return;

        config.onAccept(response);
        setAttachments([]);
        setUserText("");
        closeModal();
    };

    const handleAddAttachment = async () => {
        if (!config) return;

        try {
            if (Capacitor.isNativePlatform()) {
                // Dynamically import Capacitor Camera for native platforms
                try {
                    // Use dynamic import with variable to bypass Vite static analysis
                    const moduleName = "@capacitor/camera";
                    const cameraModule = await import(
                        /* @vite-ignore */ moduleName
                    );
                    const image = await cameraModule.Camera.getPhoto({
                        quality: 90,
                        allowEditing: false,
                        resultType: cameraModule.CameraResultType.Base64,
                        source: cameraModule.CameraSource.Photos,
                    });

                    if (image.base64String) {
                        const attachment: LLMAttachment = {
                            name: `image_${Date.now()}.${image.format}`,
                            data: image.base64String,
                            mimeType: `image/${image.format}`,
                        };
                        setAttachments((prev) => [...prev, attachment]);
                    }
                } catch {
                    // Camera plugin not available
                    showError("Camera plugin not available on this platform");
                }
            } else {
                // Use file input on web
                fileInputRef.current?.click();
            }
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.message !== "User cancelled photos app"
            ) {
                showError(`Failed to add attachment: ${error.message}`);
            }
        }
    };

    const handleFileInputChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newAttachments: LLMAttachment[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Convert to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove data URL prefix
                    const base64 = result.split(",")[1];
                    resolve(base64);
                };
                reader.onerror = reject;
            });

            reader.readAsDataURL(file);

            try {
                const base64Data = await base64Promise;
                newAttachments.push({
                    name: file.name,
                    data: base64Data,
                    mimeType: file.type,
                });
            } catch {
                showError(`Failed to read file: ${file.name}`);
            }
        }

        setAttachments((prev) => [...prev, ...newAttachments]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRunLLM = async () => {
        if (!config) return;

        if (!apiKey?.value) {
            showError(
                "OpenAI API key not configured. Please add it in Settings."
            );
            return;
        }

        // Validate at least one input type is provided
        const trimmedText = userText.trim();
        if (attachments.length === 0 && !trimmedText) {
            showError("Please provide at least one input: text or attachment.");
            return;
        }

        setIsLoading(true);
        setResponse(null);

        try {
            const client = new OpenAIClient(apiKey.value);
            const llmResponse = await client.call({
                prompt: config.prompt,
                model: config.model || "gpt-4o-mini",
                attachments: attachments.length > 0 ? attachments : undefined,
                userText: trimmedText || undefined,
            });

            setResponse(llmResponse);
        } catch (error) {
            showError(
                error instanceof Error
                    ? `LLM API error: ${error.message}`
                    : "Failed to call LLM API"
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!config) return null;

    return (
        <>
            <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{config.title || "LLM Assistant"}</IonTitle>
                        <IonButtons slot="end">
                            <IonButton
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding">
                    {/* API Key Warning */}
                    {!apiKey?.value && !isLoadingApiKey && (
                        <div
                            style={{
                                border: "2px solid var(--ion-color-danger)",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                marginBottom: "16px",
                            }}
                        >
                            <IonText color="danger">
                                <p style={{ margin: 0, fontWeight: 500 }}>
                                    ⚠️ OpenAI API key not configured. Please add
                                    it in Settings to use this feature.
                                </p>
                            </IonText>
                        </div>
                    )}

                    {/* User Instructions Display */}
                    {config.userInstructions && (
                        <IonItem lines="none">
                            <IonLabel className="ion-text-wrap">
                                <IonText color="medium">
                                    <p>{config.userInstructions}</p>
                                </IonText>
                            </IonLabel>
                        </IonItem>
                    )}

                    {/* Text Input Section */}
                    {config.allowTextInput && (
                        <div style={{ marginTop: "16px" }}>
                            <IonItem>
                                <IonLabel position="stacked">
                                    <h3>Text Input</h3>
                                </IonLabel>
                                <IonTextarea
                                    value={userText}
                                    onIonChange={(e) =>
                                        setUserText(e.detail.value || "")
                                    }
                                    placeholder="Enter your text here..."
                                    rows={4}
                                    disabled={isLoading}
                                />
                            </IonItem>
                        </div>
                    )}

                    {/* File Attachments Section */}
                    {config.allowAttachments && (
                        <div style={{ marginTop: "16px" }}>
                            <IonItem lines="none">
                                <IonLabel>
                                    <h3>Attachments</h3>
                                </IonLabel>
                                <IonButton
                                    slot="end"
                                    fill="outline"
                                    size="small"
                                    onClick={handleAddAttachment}
                                    disabled={isLoading}
                                >
                                    <IonIcon
                                        icon={
                                            Capacitor.isNativePlatform()
                                                ? camera
                                                : attach
                                        }
                                        slot="start"
                                    />
                                    Add
                                </IonButton>
                            </IonItem>

                            {attachments.length > 0 && (
                                <div
                                    style={{
                                        padding: "0 16px",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "8px",
                                    }}
                                >
                                    {attachments.map((attachment, index) => (
                                        <IonChip
                                            key={index}
                                            onClick={() =>
                                                handleRemoveAttachment(index)
                                            }
                                        >
                                            <IonLabel>
                                                {attachment.name}
                                            </IonLabel>
                                            <IonIcon icon={close} />
                                        </IonChip>
                                    ))}
                                </div>
                            )}

                            {/* Hidden file input for web */}
                            {!Capacitor.isNativePlatform() && (
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleFileInputChange}
                                />
                            )}
                        </div>
                    )}

                    {/* Run Button */}
                    {!response && (
                        <IonButton
                            expand="block"
                            onClick={handleRunLLM}
                            disabled={
                                isLoading || isLoadingApiKey || !apiKey?.value
                            }
                            style={{ marginTop: "20px" }}
                        >
                            {isLoading
                                ? "Running..."
                                : config.buttonText || "Run LLM"}
                        </IonButton>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <IonList style={{ marginTop: "20px" }}>
                            <IonItem>
                                <IonSkeletonText
                                    animated
                                    style={{ width: "100%" }}
                                />
                            </IonItem>
                            <IonItem>
                                <IonSkeletonText
                                    animated
                                    style={{ width: "80%" }}
                                />
                            </IonItem>
                            <IonItem>
                                <IonSkeletonText
                                    animated
                                    style={{ width: "90%" }}
                                />
                            </IonItem>
                        </IonList>
                    )}

                    {/* Output Display */}
                    {response && (
                        <div style={{ marginTop: "20px" }}>
                            <IonItem lines="none">
                                <IonLabel>
                                    <h3>Result</h3>
                                </IonLabel>
                            </IonItem>
                            <div style={{ padding: "0 16px" }}>
                                {config.renderOutput(response)}
                            </div>

                            {/* Accept/Cancel Buttons */}
                            <div
                                style={{
                                    marginTop: "20px",
                                    display: "flex",
                                    gap: "8px",
                                }}
                            >
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={handleClose}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </IonButton>
                                <IonButton
                                    expand="block"
                                    onClick={handleAccept}
                                    style={{ flex: 1 }}
                                >
                                    Accept
                                </IonButton>
                            </div>
                        </div>
                    )}
                </IonContent>
            </IonModal>
        </>
    );
};
