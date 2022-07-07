import type { HttpAgent, Identity } from "@dfinity/agent";
import type {
  DeployedSns,
  SnsWasmCanister,
  SnsWasmCanisterOptions,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { InitSns, SnsCanisters } from "@dfinity/sns";
import { HOST } from "../constants/environment.constants";
import { createAgent } from "../utils/agent.utils";

const listSnses = async ({
  agent,
}: {
  agent: HttpAgent;
}): Promise<Principal[]> => {
  const {
    SnsWasmCanister,
  }: {
    SnsWasmCanister: {
      create: (options: SnsWasmCanisterOptions) => SnsWasmCanister;
    };
  } = await import("@dfinity/nns/dist/esm/sns_wasm");

  const { listSnses }: SnsWasmCanister = SnsWasmCanister.create({
    canisterId: Principal.fromText("nsrxe-iiaaa-aaaaa-aacaa-cai"),
    agent,
  });

  const snses: DeployedSns[] = await listSnses({});

  return snses.reduce(
    (acc: Principal[], { root_canister_id }: DeployedSns) => [
      ...acc,
      ...root_canister_id,
    ],
    []
  );
};

/**
 * Current deployed canisters:
 * {
 *   "__Candid_UI": {
 *     "testnet": "nvqrq-fqaaa-aaaaa-aacaq-cai"
 *   },
 *   "sns_governance": {
 *     "testnet": "md3j3-qaaaa-aaaaa-aacfq-cai"
 *   },
 *   "sns_ledger": {
 *     "testnet": "mw4yw-riaaa-aaaaa-aacga-cai"
 *   },
 *   "sns_root": {
 *     "testnet": "me2pp-5yaaa-aaaaa-aacfa-cai"
 *   },
 *   "sns_swap": {
 *     "testnet": "mr56c-4qaaa-aaaaa-aacgq-cai"
 *   },
 *   "wasm_canister": {
 *     "testnet": "nsrxe-iiaaa-aaaaa-aacaa-cai"
 *   }
 * }
 */

const initSns = async ({
  agent,
  rootCanisterId,
}: {
  agent: HttpAgent;
  rootCanisterId: Principal;
}): Promise<SnsCanisters> => {
  const { initSns }: { initSns: InitSns } = await import(
    "@dfinity/sns/dist/esm/sns"
  );

  return initSns({
    rootOptions: {
      canisterId: rootCanisterId,
    },
    agent,
  });
};

export const loadSnses = async ({ identity }: { identity: Identity }) => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const rootCanisterIds: Principal[] = await listSnses({ agent });

  const sns: PromiseSettledResult<SnsCanisters>[] = await Promise.allSettled(
    rootCanisterIds.map((rootCanisterId: Principal) =>
      initSns({ agent, rootCanisterId })
    )
  );

  // TODO: filter errors
  // TODO: save somewhere the initialized sns - i.e. module variable
  // TODO: query and update calls

  // TODO: remove, test, list neurons of each Sns
  const result = await Promise.all(
    sns
      .filter(({ status }) => status === "fulfilled")
      .map(({ value: { listNeurons } }: PromiseFulfilledResult<SnsCanisters>) =>
        listNeurons({})
      )
  );

  console.log("Sns neurons", result);
};
