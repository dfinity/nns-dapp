import { HOST, WASM_CANISTER_ID } from "$lib/constants/environment.constants";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
  type SnsWasmCanisterCreate,
} from "$lib/proxy/api.import.proxy";
import { ApiErrorKey } from "$lib/types/api.errors";
import type { QueryRootCanisterId } from "$lib/types/sns.query";
import { createAgent } from "$lib/utils/agent.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import type { DeployedSns, SnsWasmCanister } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { InitSnsWrapper, SnsWrapper } from "@dfinity/sns";

let snsQueryWrappers: Promise<Map<QueryRootCanisterId, SnsWrapper>> | undefined;
let snsUpdateWrappers:
  | Promise<Map<QueryRootCanisterId, SnsWrapper>>
  | undefined;

/**
 * List all deployed Snses - i.e list all Sns projects
 *
 * @param {Object} params
 * @param params.agent
 * @param params.certified
 * @return The list of root canister id of each deployed Sns project
 */
const listSnses = async ({
  agent,
  certified,
}: {
  agent: HttpAgent;
  certified: boolean;
}): Promise<Principal[]> => {
  logWithTimestamp(`Loading list of Snses certified:${certified} call...`);

  const SnsWasmCanister: SnsWasmCanisterCreate = await importSnsWasmCanister();

  const { listSnses: getSnses }: SnsWasmCanister = SnsWasmCanister.create({
    canisterId: Principal.fromText(WASM_CANISTER_ID),
    agent,
  });

  const snses: DeployedSns[] = await getSnses({ certified });

  logWithTimestamp(`Loading list of Snses certified:${certified} complete.`);

  return snses.reduce(
    (acc: Principal[], { root_canister_id }: DeployedSns) => [
      ...acc,
      ...root_canister_id,
    ],
    []
  );
};

export const initSns = async ({
  agent,
  rootCanisterId,
  certified,
}: {
  agent: HttpAgent;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsWrapper> => {
  logWithTimestamp(
    `Initializing Sns ${rootCanisterId.toText()} certified:${certified} call...`
  );

  const initSnsWrapper: InitSnsWrapper = await importInitSnsWrapper();

  const snsWrapper: SnsWrapper = await initSnsWrapper({
    rootOptions: {
      canisterId: rootCanisterId,
    },
    agent,
    certified,
  });

  logWithTimestamp(
    `Initializing Sns ${rootCanisterId.toText()} certified:${certified} complete.`
  );

  return snsWrapper;
};

const loadSnsWrappers = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<SnsWrapper[]> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const rootCanisterIds: Principal[] = await listSnses({ agent, certified });

  const results: PromiseSettledResult<SnsWrapper>[] = await Promise.allSettled(
    rootCanisterIds.map((rootCanisterId: Principal) =>
      initSns({ agent, rootCanisterId, certified })
    )
  );

  // TODO(L2-837): do no throw an error but emit or display only an error while continuing loading and displaying Sns projects that could be successfully fetched
  const error: boolean =
    results.find(({ status }) => status === "rejected") !== undefined;
  if (error) {
    throw new ApiErrorKey("error__sns.init");
  }

  return (
    results
      .filter(({ status }) => status === "fulfilled")
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore we know for sure the type is PromiseFulfilledResult and not PromiseSettledResult since we filter with previous line
      .map(({ value: wrapper }: PromiseFulfilledResult<SnsWrapper>) => wrapper)
  );
};

const initWrappers = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<Map<QueryRootCanisterId, SnsWrapper>> =>
  new Map(
    (await loadSnsWrappers({ identity, certified })).map(
      (wrapper: SnsWrapper) => [
        wrapper.canisterIds.rootCanisterId.toText(),
        wrapper,
      ]
    )
  );

export const wrappers = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<Map<QueryRootCanisterId, SnsWrapper>> => {
  switch (certified) {
    case false:
      if (!snsQueryWrappers) {
        snsQueryWrappers = initWrappers({ identity, certified: false });
      }
      return snsQueryWrappers;
    default:
      if (!snsUpdateWrappers) {
        snsUpdateWrappers = initWrappers({ identity, certified: true });
      }
      return snsUpdateWrappers;
  }
};

export const wrapper = async ({
  identity,
  rootCanisterId,
  certified,
}: {
  identity: Identity;
  rootCanisterId: QueryRootCanisterId;
  certified: boolean;
}): Promise<SnsWrapper> => {
  const snsWrapper: SnsWrapper | undefined = (
    await wrappers({ identity, certified })
  ).get(rootCanisterId);

  if (snsWrapper === undefined) {
    throw new ApiErrorKey("error__sns.undefined_project");
  }

  return snsWrapper;
};
