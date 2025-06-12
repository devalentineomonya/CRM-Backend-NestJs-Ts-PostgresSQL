export interface ArtilleryContext {
  vars: Record<string, any>;
  [key: string]: any;
}

export type ArtilleryProcessorCallback = () => void;
