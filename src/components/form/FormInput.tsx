import { IonInput, IonItem, IonLabel, IonText } from "@ionic/react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    placeholder?: string;
    helperText?: string;
    type?: "text" | "email" | "tel" | "url" | "number";
    disabled?: boolean;
}

/**
 * Reusable form input component that integrates Ionic's IonInput with React Hook Form
 */
export function FormInput<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    helperText,
    type = "text",
    disabled = false,
}: FormInputProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <>
                    <IonItem>
                        <IonLabel position="stacked">{label}</IonLabel>
                        <IonInput
                            {...field}
                            type={type}
                            placeholder={placeholder}
                            disabled={disabled}
                            onIonInput={(e) => field.onChange(e.detail.value)}
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
