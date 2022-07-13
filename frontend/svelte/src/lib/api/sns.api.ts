import type { HttpAgent, Identity } from "@dfinity/agent";
import type { DeployedSns, SnsWasmCanister } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { InitSns, SnsWrapper } from "@dfinity/sns";
import { mockSnsSummaryList } from "../../tests/mocks/sns-projects.mock";
import { HOST } from "../constants/environment.constants";
import {
  importInitSns,
  importSnsWasmCanister,
  type SnsWasmCanisterCreate,
} from "../proxy/api.import.proxy";
import { ApiErrorKey } from "../types/api.errors";
import type { SnsSummary, SnsSwapState } from "../types/sns";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";

type RootCanisterId = string;
let snsQueryWrappers: Map<RootCanisterId, SnsWrapper> | undefined;
let snsUpdateWrappers: Map<RootCanisterId, SnsWrapper> | undefined;

// TODO(L2-751): remove and replace with effective data
let mockSwapStates: SnsSwapState[] = [];
const mockDummySwapStates: Partial<SnsSwapState>[] = [
  {
    myCommitment: BigInt(25 * 100000000),
    currentCommitment: BigInt(100 * 100000000),
  },
  {
    myCommitment: BigInt(5 * 100000000),
    currentCommitment: BigInt(775 * 100000000),
  },
  {
    myCommitment: undefined,
    currentCommitment: BigInt(1000 * 100000000),
  },
  {
    myCommitment: undefined,
    currentCommitment: BigInt(1500 * 100000000),
  },
];

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

  // TODO(L2-828): extract property for wasm canister id

  const { listSnses }: SnsWasmCanister = SnsWasmCanister.create({
    canisterId: Principal.fromText("nsrxe-iiaaa-aaaaa-aacaa-cai"),
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

  const initSns: InitSns = await importInitSns();

  const snsWrapper: SnsWrapper = await initSns({
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
}): Promise<Map<RootCanisterId, SnsWrapper>> =>
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
}): Promise<Map<RootCanisterId, SnsWrapper>> => {
  // TODO: there is probably a better solution
  switch (certified) {
    case false:
      if (!snsQueryWrappers) {
        snsQueryWrappers = await initWrappers({ identity, certified: false });
      }
      return snsQueryWrappers;
    default:
      if (!snsUpdateWrappers) {
        snsUpdateWrappers = await initWrappers({ identity, certified: true });
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
  rootCanisterId: RootCanisterId;
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
let mockSnsSummaries: SnsSummary[] = [];

export const querySnsSummaries = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<SnsSummary[]> => {
  logWithTimestamp(
    `Listing all deployed Sns summaries certified:${certified} call...`
  );

  const snsWrappers: SnsWrapper[] = [
    ...(
      (await wrappers({ identity, certified })) ??
      new Map<RootCanisterId, SnsWrapper>()
    ).values(),
  ];

  // TODO(L2-830): we also want to have a status within each summary to display the information progressively
  const summaries: (SnsSummary | undefined)[] = await Promise.all(
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
    (summary: SnsSummary | undefined) => summary !== undefined
  ) as SnsSummary[];
};

export const querySnsSummary = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: RootCanisterId;
  identity: Identity;
  certified: boolean;
}): Promise<SnsSummary | undefined> => {
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
        new Map<RootCanisterId, SnsWrapper>()
      ).values(),
    ].map(({ canisterIds: { rootCanisterId } }: SnsWrapper) => ({
      ...mockSnsSummaryList[
        Math.floor(0 + Math.random() * (mockSnsSummaryList.length - 1))
      ],
      rootCanisterId,
    }));
  }

  // TODO(L2-829, L2-751): remove and replace with effective data - i.e. summary comes from sns gov canister through sns wrapper
  console.log("Sns metadata", summary);
  return mockSnsSummaries.find(
    ({ rootCanisterId: canisterId }: SnsSummary) =>
      canisterId.toText() === rootCanisterId
  );
};

export const querySnsSwapStates = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<SnsSwapState[]> => {
  logWithTimestamp(
    `Listing all deployed Sns swap states certified:${certified} call...`
  );

  const snsWrappers: SnsWrapper[] = [
    ...(
      (await wrappers({ identity, certified })) ??
      new Map<RootCanisterId, SnsWrapper>()
    ).values(),
  ];

  // TODO(L2-830): we also want to have a status within each summary to display the information progressively
  const swapStates: (SnsSwapState | undefined)[] = await Promise.all(
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

  return swapStates.filter(
    (state: SnsSwapState | undefined) => state !== undefined
  ) as SnsSwapState[];
};

export const querySnsSwapState = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: RootCanisterId;
  identity: Identity;
  certified: boolean;
}): Promise<SnsSwapState> => {
  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap state certified:${certified} call...`
  );

  const { swapState }: SnsWrapper = await wrapper({
    rootCanisterId,
    identity,
    certified,
  });

  const { swap } = await swapState({});

  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap state certified:${certified} done.`
  );

  // TODO(L2-751): remove mock data
  if (mockSwapStates.length === 0) {
    mockSwapStates = [
      ...(
        (await wrappers({ identity, certified })) ??
        new Map<RootCanisterId, SnsWrapper>()
      ).values(),
    ].map(
      ({ canisterIds: { rootCanisterId } }) =>
        ({
          ...mockDummySwapStates[
            Math.floor(0 + Math.random() * (mockDummySwapStates.length - 1))
          ],
          rootCanisterId,
        } as SnsSwapState)
    );
  }

  // TODO(L2-829, L2-751): remove and replace with effective data - i.e. summary comes from sns gov canister through sns wrapper
  console.log("Sns swap state", swap);
  return mockSwapStates.find(
    (mock) => rootCanisterId === mock.rootCanisterId.toText()
  ) as SnsSwapState;
};
