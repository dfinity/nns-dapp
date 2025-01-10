import {
  CanisterStatus,
  type CanisterDetails,
} from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  CKBTC_INDEX_CANISTER_ID,
  CKBTC_MINTER_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import type { CanistersStore } from "$lib/stores/canisters.store";
import type { SelectCanisterDetailsStore } from "$lib/types/canister-detail.context";
import { Principal } from "@dfinity/principal";
import { writable, type Subscriber } from "svelte/store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";

export const mockCanisterId = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
export const mockCanister: CanisterInfo = {
  name: "",
  canister_id: mockCanisterId,
  block_index: [123n],
};
export const mockCanisters: CanisterInfo[] = [
  {
    name: "test1",
    canister_id: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
    block_index: [123n],
  },
  mockCanister,
];

export const mockCanisterSettings = {
  freezing_threshold: 2n,
  controllers: [
    "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe",
  ],
  memory_allocation: 4n,
  compute_allocation: 10n,
};

export const mockCanisterDetails: CanisterDetails = {
  id: mockCanisterId,
  status: CanisterStatus.Running,
  memorySize: 10n,
  cycles: 30n,
  settings: {
    controllers: [mockIdentity.getPrincipal().toText()],
    freezingThreshold: 30n,
    memoryAllocation: 1_000n,
    computeAllocation: 2_000n,
  },
  idleCyclesBurnedPerDay: 3_000n,
};

export const mockCanistersStoreSubscribe = (
  run: Subscriber<CanistersStore>
): (() => void) => {
  run({ canisters: mockCanisters, certified: true });

  return () => undefined;
};

export const mockCanisterDetailsStore = writable<SelectCanisterDetailsStore>({
  info: mockCanister,
  details: mockCanisterDetails,
  controller: true,
});

export const mockCkBTCAdditionalCanisters = {
  minterCanisterId: CKBTC_MINTER_CANISTER_ID,
  indexCanisterId: CKBTC_INDEX_CANISTER_ID,
};
