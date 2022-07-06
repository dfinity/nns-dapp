import type { HttpAgent, Identity } from "@dfinity/agent";
import type { DeployedSns } from "@dfinity/nns";
import type { SnsWasmCanister } from "@dfinity/nns/dist/esm/sns_wasm";
import { Principal } from "@dfinity/principal";
import type { InitSns, SnsCanisters } from "@dfinity/sns";
import { HOST } from "../constants/environment.constants";
import { createAgent } from "../utils/agent.utils";

const listSnses = async ({
  agent,
}: {
  agent: HttpAgent;
}): Promise<Principal[]> => {
  const { SnsWasmCanister }: { SnsWasmCanister: SnsWasmCanister } =
    await import("@dfinity/nns/dist/esm/sns_wasm");

  const { listSnses }: SnsWasmCanister = SnsWasmCanister.create({
    canisterId: Principal.fromText("zeke2-yaaaa-aaaaa-aabvq-cai"),
    agent,
  });

  // TODO: typescript definition does not work
  const snses: DeployedSns[] = await listSnses({});

  return snses.reduce(
    (acc: Principal[], { root_canister_id }: DeployedSns) => [
      ...acc,
      ...root_canister_id,
    ],
    []
  );
};

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
      canisterId: rootCanisterId, // Currently deployed Principal.fromText("zdlco-vyaaa-aaaaa-aabva-cai"),
      agent,
    },
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

  // TODO: remove, test, list neurons of each Sns
  await Promise.all(
    sns
      .filter(({ status }) => status === "fulfilled")
      .map(({ value: { listNeurons } }: PromiseFulfilledResult<SnsCanisters>) =>
        listNeurons({})
      )
  );
};
