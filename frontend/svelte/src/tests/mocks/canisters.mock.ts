import { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";
import {
  CanisterStatus,
  type CanisterDetails,
} from "../../lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "../../lib/canisters/nns-dapp/nns-dapp.types";
import type { CanistersStore } from "../../lib/stores/canisters.store";
import { mockIdentity } from "./auth.store.mock";

export const mockCanister = {
  name: "",
  canister_id: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
};
export const mockCanisters: CanisterInfo[] = [
  {
    name: "test1",
    canister_id: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
  },
  mockCanister,
];

export const mockCanisterDetails: CanisterDetails = {
  id: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
  status: CanisterStatus.Running,
  memorySize: BigInt(10),
  cycles: BigInt(30),
  setting: {
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
