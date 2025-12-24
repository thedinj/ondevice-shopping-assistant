import { DatabaseChangeListener, DatabaseEvents } from "./types";

/**
 * Base class providing change-listener management for database implementations.
 */
export abstract class BaseDatabase implements DatabaseEvents {
    private listeners: Set<DatabaseChangeListener> = new Set();

    onChange(listener: DatabaseChangeListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    protected notifyChange() {
        this.listeners.forEach((listener) => listener());
    }
}
