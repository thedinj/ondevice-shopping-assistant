import { LocationSelectors as SharedLocationSelectors } from "../shared/LocationSelectors";
import { useItemEditorContext } from "./useItemEditorContext";

export const LocationSelectors = () => {
    const { control, setValue, watch, storeId } = useItemEditorContext();

    return (
        <SharedLocationSelectors
            control={control}
            setValue={setValue}
            watch={watch}
            storeId={storeId}
        />
    );
};
