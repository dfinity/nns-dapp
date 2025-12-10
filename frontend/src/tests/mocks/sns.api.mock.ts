import { principal } from "$tests/mocks/sns-projects.mock";
import type { SnsWasmDid } from "@icp-sdk/canisters/nns";
import type { SnsRootDid } from "@icp-sdk/canisters/sns";
import { Principal } from "@icp-sdk/core/principal";

export const mockSnsCanisterIdText = "pin7y-wyaaa-aaaaa-aacpa-cai";
export const mockSnsCanisterId = Principal.fromText(mockSnsCanisterIdText);

export const deployedSnsMock: SnsWasmDid.DeployedSns[] = [
  {
    root_canister_id: [mockSnsCanisterId],
    governance_canister_id: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
    index_canister_id: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
    swap_canister_id: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
    ledger_canister_id: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
  },
  {
    root_canister_id: [Principal.fromText("zdlco-vyaaa-aaaaa-aabva-cai")],
    governance_canister_id: [Principal.fromText("zdlco-vyaaa-aaaaa-aabva-cai")],
    index_canister_id: [Principal.fromText("zdlco-vyaaa-aaaaa-aabva-cai")],
    swap_canister_id: [Principal.fromText("zdlco-vyaaa-aaaaa-aabva-cai")],
    ledger_canister_id: [Principal.fromText("zdlco-vyaaa-aaaaa-aabva-cai")],
  },
];

export const rootCanisterIdMock: Principal = principal(0);

export const ledgerCanisterIdMock: Principal = Principal.fromText(
  "ktxdj-qiaaa-aaaaa-aacqa-cai"
);

export const governanceCanisterIdMock: Principal = Principal.fromText(
  "ppmzm-3aaaa-aaaaa-aacpq-cai"
);

export const swapCanisterIdMock: Principal = Principal.fromText(
  "kuwf5-5qaaa-aaaaa-aacqq-cai"
);

export const indexCanisterIdMock: Principal = Principal.fromText(
  "pin7y-wyaaa-aaaaa-aacpa-cai"
);

export const snsMock: [string, Principal, SnsRootDid.CanisterStatusResultV2][] =
  [
    [
      "root",
      rootCanisterIdMock,
      {} as unknown as SnsRootDid.CanisterStatusResultV2,
    ],
    [
      "ledger",
      ledgerCanisterIdMock,
      {} as unknown as SnsRootDid.CanisterStatusResultV2,
    ],
    [
      "governance",
      governanceCanisterIdMock,
      {} as unknown as SnsRootDid.CanisterStatusResultV2,
    ],
    [
      "swap",
      swapCanisterIdMock,
      {} as unknown as SnsRootDid.CanisterStatusResultV2,
    ],
  ];
