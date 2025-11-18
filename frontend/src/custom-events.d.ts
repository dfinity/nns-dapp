declare module "svelte/elements" {
  export interface HTMLAttributes {
    // svelte
    "on:nnsIntersecting"?: CompositionEventHandler;
    "on:nnsCanisterDetailModal"?: CompositionEventHandler;
    "on:nnsNeuronDetailModal"?: CompositionEventHandler;
    "on:snsNeuronDetailModal"?: CompositionEventHandler;
    "on:nnsWalletModal"?: CompositionEventHandler;
    "on:nnsCkBTCAccountsModal"?: CompositionEventHandler;
    "on:nnsAccountsModal"?: CompositionEventHandler;
    "on:nnsIcrcTokenModal"?: CompositionEventHandler;

    // svelte5
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nnsIntersecting?: (event: CustomEvent<any>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nnsCanisterDetailModal?: (event: CustomEvent<any>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nnsNeuronDetailModal?: (event: CustomEvent<any>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snsNeuronDetailModal?: (event: CustomEvent<any>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nnsWalletModal?: (event: CustomEvent<any>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nnsCkBTCAccountsModal?: (event: CustomEvent<any>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nnsAccountsModal?: (event: CustomEvent<any>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nnsIcrcTokenModal?: (event: CustomEvent<any>) => void;
  }
}

export {};
