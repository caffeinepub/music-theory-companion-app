import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    getAllKeys(): Promise<Array<string>>;
    getAllTheoryTopics(): Promise<Array<string>>;
    getChordProgressions(key: string): Promise<Array<string> | null>;
    getCompositionSuggestions(key: string): Promise<string | null>;
    getImprovisationTips(key: string): Promise<string | null>;
    getScaleInformation(key: string): Promise<string | null>;
    getTheoryExplanation(topic: string): Promise<string | null>;
}
