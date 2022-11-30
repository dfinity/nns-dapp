import {
  CanisterStatus,
  type CanisterDetails,
} from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { CanistersStore } from "$lib/stores/canisters.store";
import type { SelectCanisterDetailsStore } from "$lib/types/canister-detail.context";
import { Principal } from "@dfinity/principal";
import { writable, type Subscriber } from "svelte/store";
import { mockIdentity } from "./auth.store.mock";

export const mockCanisterId = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
export const mockCanister = {
  name: "",
  canister_id: mockCanisterId,
};
export const mockCanisters: CanisterInfo[] = [
  {
    name: "test1",
    canister_id: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
  },
  mockCanister,
];

export const mockCanisterSettings = {
  freezing_threshold: BigInt(2),
  controllers: [
    "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe",
  ],
  memory_allocation: BigInt(4),
  compute_allocation: BigInt(10),
};

export const mockCanisterDetails: CanisterDetails = {
  id: mockCanisterId,
  status: CanisterStatus.Running,
  memorySize: BigInt(10),
  cycles: BigInt(30),
  settings: {
    controllers: [mockIdentity.getPrincipal().toText()],
    freezingThreshold: BigInt(30),
    memoryAllocation: BigInt(1000),
    computeAllocation: BigInt(2000),
  },
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
