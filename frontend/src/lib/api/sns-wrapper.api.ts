import { createAgent } from "$lib/api/agent.api";
import { WASM_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
  type SnsWasmCanisterCreate,
} from "$lib/proxy/api.import.proxy";
import { ApiErrorKey } from "$lib/types/api.errors";
import type { QueryRootCanisterId } from "$lib/types/sns.query";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Agent, Identity } from "@dfinity/agent";
import { IcrcIndexCanister, IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import type { DeployedSns, SnsWasmCanister } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsGovernanceCanister,
  SnsRootCanister,
  SnsSwapCanister,
  SnsWrapper,
  type InitSnsWrapper,
} from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";

interface IdentityWrapper {
  [principal: string]: Promise<Map<QueryRootCanisterId, SnsWrapper>>;
}

let identitiesCertifiedWrappers: IdentityWrapper = {};
let identitiesNotCertifiedWrappers: IdentityWrapper = {};

// ONLY FOR TESTING PURPOSES
export const clearWrapperCache = () => {
  identitiesCertifiedWrappers = {};
  identitiesNotCertifiedWrappers = {};
};

type CanisterIds = {
  rootCanisterId: Principal;
  governanceCanisterId: Principal;
  ledgerCanisterId: Principal;
  swapCanisterId: Principal;
  indexCanisterId: Principal;
};
export const buildAndStoreWrapper = async ({
  identity,
  certified,
  canisterIds: {
    rootCanisterId,
    governanceCanisterId,
    ledgerCanisterId,
    swapCanisterId,
    indexCanisterId,
  },
}: {
  identity: Identity;
  certified: boolean;
  canisterIds: CanisterIds;
}) => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });
  const wrapper = new SnsWrapper({
    root: SnsRootCanister.create({ canisterId: rootCanisterId, agent }),
    governance: SnsGovernanceCanister.create({
      canisterId: governanceCanisterId,
      agent,
    }),
    ledger: IcrcLedgerCanister.create({ canisterId: ledgerCanisterId, agent }),
    swap: SnsSwapCanister.create({ canisterId: swapCanisterId, agent }),
    index: IcrcIndexCanister.create({ canisterId: indexCanisterId, agent }),
    certified,
  });

  const identitiesMap = certified
    ? identitiesCertifiedWrappers
    : identitiesNotCertifiedWrappers;

  if (nonNullish(identitiesMap[identity.getPrincipal().toText()])) {
    const wrappersMap = await identitiesMap[identity.getPrincipal().toText()];
    wrappersMap.set(rootCanisterId.toText(), wrapper);
  } else {
    identitiesMap[identity.getPrincipal().toText()] = Promise.resolve(
      new Map([[rootCanisterId.toText(), wrapper]])
    );
  }
};

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
  agent: Agent;
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
  agent: Agent;
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
    const rejectedReasons = results
      .filter(({ status }) => status === "rejected")
      .map((wrapper) =>
        "reason" in wrapper ? wrapper.reason : "Reason not present"
      );
    console.error("Rejected SNSes:", rejectedReasons);
    // Ignoring. SNSes will be filtered out below.
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
  const principalText = identity.getPrincipal().toText();
  if (certified) {
    if (identitiesCertifiedWrappers[principalText] === undefined) {
      // the initialization of the wrappers can be called mutliple times at the same time when the app loads.
      // We cache the promise so that if multiple calls are made then all will resolve when the first init resolve.
      identitiesCertifiedWrappers[principalText] = initWrappers({
        identity,
        certified,
      });
    }
    return identitiesCertifiedWrappers[principalText];
  } else {
    if (identitiesNotCertifiedWrappers[principalText] === undefined) {
      identitiesNotCertifiedWrappers[principalText] = initWrappers({
        identity,
        certified,
      });
    }
    return identitiesNotCertifiedWrappers[principalText];
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
