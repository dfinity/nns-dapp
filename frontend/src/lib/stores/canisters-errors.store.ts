import { writable, type Readable } from "svelte/store";

type CanisterId = string;
type CanisterError = {
  raw: unknown;
};
export type CanistersErrorsStoreData = Record<CanisterId, CanisterError>;

export interface CanistersErrorsStore
  extends Readable<CanistersErrorsStoreData> {
  set: (params: { canisterId: CanisterId; rawError: unknown }) => void;
  delete: (canisterId: CanisterId) => void;
}

export const initCanistersErrorsStore = (): CanistersErrorsStore => {
  const initialCanistersErrors: CanistersErrorsStoreData = {};

  const { subscribe, update } = writable<CanistersErrorsStoreData>(
    initialCanistersErrors
  );

  return {
    subscribe,
    set: ({ canisterId, rawError }) => {
      update((currentState: CanistersErrorsStoreData) => ({
        ...currentState,
        [canisterId]: {
          raw: rawError,
        },
      }));
    },
    delete: (canisterId) => {
      update(
        ({
          [canisterId]: _,
          ...restOfCanisters
        }: CanistersErrorsStoreData) => ({
          ...restOfCanisters,
        })
      );
    },
  };
};

export const canistersErrorsStore = initCanistersErrorsStore();
