import { writable } from 'svelte/store';

export const areOperationsExpanded = writable(false);
export const operationsVisibility = writable([] as boolean[]);
