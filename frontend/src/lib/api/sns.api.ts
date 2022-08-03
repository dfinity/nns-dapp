import type { HttpAgent, Identity } from "@dfinity/agent";
import type { DeployedSns, ICP, SnsWasmCanister } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type {
  InitSnsWrapper,
  SnsNeuron,
  SnsSwapBuyerState,
  SnsWrapper,
} from "@dfinity/sns";
import { mockSnsSummaryList } from "../../tests/mocks/sns-projects.mock";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import { HOST, WASM_CANISTER_ID } from "../constants/environment.constants";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
  type SnsWasmCanisterCreate,
} from "../proxy/api.import.proxy";
import { snsesCountStore } from "../stores/sns.store";
import { ApiErrorKey } from "../types/api.errors";
import type { SnsSwapCommitment } from "../types/sns";
import type {
  QueryRootCanisterId,
  QuerySnsSummary,
  QuerySnsSwapState,
} from "../types/sns.query";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { getSwapCanisterAccount } from "../utils/sns.utils";
import { ledgerCanister } from "./ledger.api";

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

  const { listSnses }: SnsWasmCanister = SnsWasmCanister.create({
    canisterId: Principal.fromText(WASM_CANISTER_ID),
    agent,
  });

  const snses: DeployedSns[] = await listSnses({ certified });

  logWithTimestamp(`Loading list of Snses certified:${certified} complete.`);

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

  snsesCountStore.set(rootCanisterIds.length);

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

  return results
    .filter(({ status }) => status === "fulfilled")
    .map(({ value: wrapper }: PromiseFulfilledResult<SnsWrapper>) => wrapper);
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

const wrappers = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<Map<QueryRootCanisterId, SnsWrapper>> => {
  // TODO: there is probably a better solution
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

const wrapper = async ({
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

// TODO(L2-751): remove mock data
let mockSnsSummaries: QuerySnsSummary[] = [];

// TODO: ultimately querySnsSummaries and querySummary will not return SnsSummary types but rather a summary related types provided by Candid sns governance
export const querySnsSummaries = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<QuerySnsSummary[]> => {
  logWithTimestamp(
    `Listing all deployed Sns summaries certified:${certified} call...`
  );

  const snsWrappers: SnsWrapper[] = [
    ...(
      (await wrappers({ identity, certified })) ??
      new Map<QueryRootCanisterId, SnsWrapper>()
    ).values(),
  ];

  // TODO(L2-830): we also want to have a status within each summary to display the information progressively
  const summaries: (QuerySnsSummary | undefined)[] = await Promise.all(
    snsWrappers.map(({ canisterIds: { rootCanisterId } }: SnsWrapper) =>
      querySnsSummary({
        rootCanisterId: rootCanisterId.toText(),
        certified,
        identity,
      })
    )
  );

  logWithTimestamp(
    `Listing all deployed Sns summaries certified:${certified} done.`
  );

  return summaries.filter(
    (summary: QuerySnsSummary | undefined) => summary !== undefined
  ) as QuerySnsSummary[];
};

export const querySnsSummary = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: QueryRootCanisterId;
  identity: Identity;
  certified: boolean;
}): Promise<QuerySnsSummary | undefined> => {
  logWithTimestamp(
    `Getting Sns ${rootCanisterId} summary certified:${certified} call...`
  );

  const { metadata }: SnsWrapper = await wrapper({
    rootCanisterId,
    identity,
    certified,
  });

  const summary = await metadata({});

  logWithTimestamp(
    `Getting Sns ${rootCanisterId} summary certified:${certified} done.`
  );

  // TODO(L2-829): mock data to be removed and replaced
  if (mockSnsSummaries.length === 0) {
    mockSnsSummaries = [
      ...(
        (await wrappers({ identity, certified })) ??
        new Map<QueryRootCanisterId, SnsWrapper>()
      ).values(),
    ].map(({ canisterIds: { rootCanisterId } }: SnsWrapper, index) => ({
      ...mockSnsSummaryList[index],
      rootCanisterId,
      certified
    }));
  }

  // TODO(L2-829, L2-751): remove and replace with effective data - i.e. summary comes from sns gov canister through sns wrapper
  return mockSnsSummaries.find(
    ({ rootCanisterId: canisterId }: QuerySnsSummary) =>
      canisterId?.toText() === rootCanisterId
  );
};

export const querySnsSwapStates = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<QuerySnsSwapState[]> => {
  logWithTimestamp(
    `Listing all deployed Sns swap states certified:${certified} call...`
  );

  const snsWrappers: SnsWrapper[] = [
    ...(
      (await wrappers({ identity, certified })) ??
      new Map<QueryRootCanisterId, SnsWrapper>()
    ).values(),
  ];

  // TODO(L2-830): we also want to have a status within each summary to display the information progressively?
  const swaps: (QuerySnsSwapState | undefined)[] = await Promise.all(
    snsWrappers.map(({ canisterIds: { rootCanisterId } }: SnsWrapper) =>
      querySnsSwapState({
        rootCanisterId: rootCanisterId.toText(),
        certified,
        identity,
      })
    )
  );

  logWithTimestamp(
    `Listing all deployed Sns swap states certified:${certified} done.`
  );

  return swaps.filter(
    (state: QuerySnsSwapState | undefined) => state !== undefined
  ) as QuerySnsSwapState[];
};

export const querySnsSwapState = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: QueryRootCanisterId;
  identity: Identity;
  certified: boolean;
}): Promise<QuerySnsSwapState | undefined> => {
  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap state certified:${certified} call...`
  );

  const {
    swapState,
    canisterIds: { swapCanisterId },
  }: SnsWrapper = await wrapper({
    rootCanisterId,
    identity,
    certified,
  });

  const { swap, derived } = await swapState({});

  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap state certified:${certified} done.`
  );

  return {
    rootCanisterId,
    swapCanisterId,
    swap,
    derived,
    certified
  };
};

export const querySnsSwapCommitments = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<SnsSwapCommitment[]> => {
  logWithTimestamp(
    `Listing all deployed Sns swap commitments certified:${certified} call...`
  );

  const snsWrappers: SnsWrapper[] = [
    ...(
      (await wrappers({ identity, certified })) ??
      new Map<QueryRootCanisterId, SnsWrapper>()
    ).values(),
  ];

  const swapCommitments: (SnsSwapCommitment | undefined)[] = await Promise.all(
    snsWrappers.map(({ canisterIds: { rootCanisterId } }: SnsWrapper) =>
      querySnsSwapCommitment({
        rootCanisterId: rootCanisterId.toText(),
        certified,
        identity,
      })
    )
  );

  logWithTimestamp(
    `Listing all deployed Sns swap commitments certified:${certified} done.`
  );

  return swapCommitments.filter(
    (state: SnsSwapCommitment | undefined) => state !== undefined
  ) as SnsSwapCommitment[];
};

export const querySnsSwapCommitment = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: QueryRootCanisterId;
  identity: Identity;
  certified: boolean;
}): Promise<SnsSwapCommitment> => {
  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap commitment certified:${certified} call...`
  );

  const { getUserCommitment }: SnsWrapper = await wrapper({
    rootCanisterId,
    identity,
    certified,
  });

  const userCommitment: SnsSwapBuyerState | undefined = await getUserCommitment(
    {
      principal_id: [identity.getPrincipal()],
    }
  );

  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap commitment certified:${certified} done.`
  );

  return {
    rootCanisterId: Principal.fromText(rootCanisterId),
    myCommitment: userCommitment,
  };
};

export const participateInSnsSwap = async ({
  amount,
  controller,
  identity,
  rootCanisterId,
  fromSubAccount,
}: {
  amount: ICP;
  controller: Principal;
  identity: Identity;
  rootCanisterId: Principal;
  fromSubAccount?: SubAccountArray;
}): Promise<void> => {
  logWithTimestamp("Participating in swap: call...");

  const { canister: nnsLedger } = await ledgerCanister({ identity });
  const {
    canisterIds: { swapCanisterId },
    notifyParticipation,
  } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });
  const accountIdentifier = getSwapCanisterAccount({
    swapCanisterId,
    controller,
  });

  // Send amount to the ledger
  await nnsLedger.transfer({
    amount,
    fromSubAccount,
    to: accountIdentifier,
  });

  // Notify participation
  await notifyParticipation({ buyer: controller.toText() });

  logWithTimestamp("Participating in swap: done");
};

export const querySnsNeurons = async ({
  identity,
  rootCanisterId,
  certified,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsNeuron[]> => {
  logWithTimestamp("Getting sns neurons: call...");
  const { listNeurons } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });
  const neurons = await listNeurons({});

  logWithTimestamp("Getting sns neurons: done");
  return neurons;
};
