import { IonItem, IonLabel, IonText, IonToggle } from "@ionic/react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface FormToggleProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    helperText?: string;
    disabled?: boolean;
}

/**
 * Reusable toggle component that integrates Ionic's IonToggle with React Hook Form
 */
export function FormToggle<T extends FieldValues>({
    name,
    control,
    label,
    helperText,
    disabled = false,
}: FormToggleProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <>
                    <IonItem>
                        <IonLabel>{label}</IonLabel>
                        <IonToggle
                            checked={field.value}
                            onIonChange={(e) =>
                                field.onChange(e.detail.checked)
                            }
                            disabled={disabled}
                        />
                    </IonItem>
                    {helperText && !error && (
                        <IonText color="medium">
                            <p
                                className="ion-padding-start ion-padding-end"
                                style={{
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {helperText}
                            </p>
                        </IonText>
                    )}
                    {error && (
                        <IonText color="danger">
                            <p
                                className="ion-padding-start ion-padding-end"
                                style={{
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {error.message}
                            </p>
                        </IonText>
                    )}
                </>
            )}
        />
    );
}
