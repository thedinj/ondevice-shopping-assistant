import { createContext } from "react";
import { Control, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { ItemFormData, Aisle, Section, AutocompleteItem } from "./itemEditorSchema";

export interface ItemEditorContextType {
    // Form control
    control: Control<ItemFormData>;
    errors: FieldErrors<ItemFormData>;
    setValue: UseFormSetValue<ItemFormData>;
    watch: UseFormWatch<ItemFormData>;
    
    // Store data
    aisles: Aisle[] | undefined;
    sections: Section[] | undefined;
    
    // Autocomplete
    autocompleteResults: AutocompleteItem[] | undefined;
}

export const ItemEditorContext = createContext<ItemEditorContextType | undefined>(undefined);
