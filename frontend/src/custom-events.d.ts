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
    nnsIntersecting?: (event: CustomEvent<any>) => void;
    nnsCanisterDetailModal?: (event: CustomEvent<any>) => void;
    nnsNeuronDetailModal?: (event: CustomEvent<any>) => void;
    snsNeuronDetailModal?: (event: CustomEvent<any>) => void;
    nnsWalletModal?: (event: CustomEvent<any>) => void;
    nnsCkBTCAccountsModal?: (event: CustomEvent<any>) => void;
    nnsAccountsModal?: (event: CustomEvent<any>) => void;
    nnsIcrcTokenModal?: (event: CustomEvent<any>) => void;
  }
}

export {};
