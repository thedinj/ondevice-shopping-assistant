/**
 * Store Scan Feature - LLM-powered aisle/section extraction
 */

/**
 * LLM response structure for store directory scan
 */
export interface StoreScanResult {
    aisles: Array<{
        name: string;
        sections: string[];
    }>;
}

/**
 * Transformed data ready for database insertion
 */
export interface TransformedStoreScanData {
    aisles: Array<{
        name: string;
        sort_order: number;
    }>;
    sections: Array<{
        aisleName: string;
        name: string;
        sort_order: number;
    }>;
}

/**
 * Transform LLM scan result into database-ready structure
 */
export function transformStoreScanResult(
    result: StoreScanResult
): TransformedStoreScanData {
    const transformed: TransformedStoreScanData = {
        aisles: [],
        sections: [],
    };

    if (!result.aisles || result.aisles.length === 0) {
        throw new Error("No aisles found in scan result");
    }

    result.aisles.forEach((aisle, aisleIndex) => {
        // Add aisle with sort_order
        transformed.aisles.push({
            name: aisle.name.trim(),
            sort_order: aisleIndex,
        });

        // Add sections for this aisle
        if (aisle.sections && aisle.sections.length > 0) {
            aisle.sections.forEach((section, sectionIndex) => {
                transformed.sections.push({
                    aisleName: aisle.name.trim(),
                    name: section.trim(),
                    sort_order: sectionIndex,
                });
            });
        }
    });

    return transformed;
}

/**
 * Validate that the scan result has the expected structure
 */
export function validateStoreScanResult(
    data: unknown
): data is StoreScanResult {
    if (!data || typeof data !== "object") {
        return false;
    }

    const result = data as StoreScanResult;

    if (!Array.isArray(result.aisles)) {
        return false;
    }

    for (const aisle of result.aisles) {
        if (typeof aisle.name !== "string" || !aisle.name.trim()) {
            return false;
        }
        if (!Array.isArray(aisle.sections)) {
            return false;
        }
        for (const section of aisle.sections) {
            if (typeof section !== "string") {
                return false;
            }
        }
    }

    return true;
}
