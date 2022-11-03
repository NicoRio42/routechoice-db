import { writable } from "svelte/store";

const selectedLeg = writable<number | null>(null);

export default selectedLeg;
