import { Principal } from "@dfinity/principal";
import type { CanisterDetails } from "../../lib/canisters/nns-dapp/nns-dapp.types";

export const mockCanisters: CanisterDetails[] = [
  {
    name: "test1",
    canister_id: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
  },
  { name: "", canister_id: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai") },
];
