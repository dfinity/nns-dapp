import type { DeployedSns } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { CanisterStatusResultV2 } from "@dfinity/sns";

export const deployedSnsMock: DeployedSns[] = [
  {
    root_canister_id: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
  },
  {
    root_canister_id: [Principal.fromText("zdlco-vyaaa-aaaaa-aabva-cai")],
  },
];

export const rootCanisterIdMock: Principal = Principal.fromText(
  "pin7y-wyaaa-aaaaa-aacpa-cai"
);

export const ledgerCanisterIdMock: Principal = Principal.fromText(
  "ktxdj-qiaaa-aaaaa-aacqa-cai"
);

export const governanceCanisterIdMock: Principal = Principal.fromText(
  "ppmzm-3aaaa-aaaaa-aacpq-cai"
);

export const swapCanisterIdMock: Principal = Principal.fromText(
  "kuwf5-5qaaa-aaaaa-aacqq-cai"
);

export const snsMock: [string, Principal, CanisterStatusResultV2][] = [
  ["root", rootCanisterIdMock, {} as unknown as CanisterStatusResultV2],
  ["ledger", ledgerCanisterIdMock, {} as unknown as CanisterStatusResultV2],
  [
    "governance",
    governanceCanisterIdMock,
    {} as unknown as CanisterStatusResultV2,
  ],
  ["swap", swapCanisterIdMock, {} as unknown as CanisterStatusResultV2],
];
