import React, { PropsWithChildren, ReactNode } from "react";
import {
    Control,
    FieldErrors,
    UseFormSetValue,
    UseFormWatch,
} from "react-hook-form";
import {
    useStoreAisles,
    useStoreItemAutocomplete,
    useStoreSections,
} from "../../db/hooks";
import {
    ItemEditorContext,
    ItemEditorContextType,
} from "./itemEditorContextDef";
import type { ItemFormData } from "./itemEditorSchema";

interface ItemEditorProviderProps {
    storeId: string;
    control: Control<ItemFormData>;
    errors: FieldErrors<ItemFormData>;
    setValue: UseFormSetValue<ItemFormData>;
    watch: UseFormWatch<ItemFormData>;
    children: ReactNode;
}

export const ItemEditorProvider: React.FC<
    PropsWithChildren<ItemEditorProviderProps>
> = ({ storeId, control, errors, setValue, watch, children }) => {
    const { data: aisles } = useStoreAisles(storeId);
    const { data: sections } = useStoreSections(storeId);
    const { data: autocompleteResults } = useStoreItemAutocomplete(storeId, "");

    const value: ItemEditorContextType = {
        control,
        errors,
        setValue,
        watch,
        aisles,
        sections,
        autocompleteResults,
    };

    return (
        <ItemEditorContext.Provider value={value}>
            {children}
        </ItemEditorContext.Provider>
    );
};
