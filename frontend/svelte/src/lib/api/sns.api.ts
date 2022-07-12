import type { HttpAgent, Identity } from "@dfinity/agent";
import type {
  DeployedSns,
  SnsWasmCanister,
  SnsWasmCanisterOptions,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { InitSns, SnsWrapper } from "@dfinity/sns";
import { mockSnsSummaryList } from "../../tests/mocks/sns-projects.mock";
import { HOST } from "../constants/environment.constants";
import type { SnsSummary } from "../types/sns";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { ApiErrorKey } from "./errors.api";

type RootCanisterId = string;
let snsQueryWrappers: Map<RootCanisterId, SnsWrapper> | undefined;
let snsUpdateWrappers: Map<RootCanisterId, SnsWrapper> | undefined;

// TODO(L2-829): to be deleted
export const mockAbout5SecondsWaiting = <T>(generator: () => T): Promise<T> =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve(generator()),
      Math.round((0.5 + Math.random() * 4.5) * 1000)
    )
  );

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

  const {
    SnsWasmCanister,
  }: {
    SnsWasmCanister: {
      create: (options: SnsWasmCanisterOptions) => SnsWasmCanister;
    };
  } = await import("@dfinity/nns/dist/esm/sns_wasm");

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

  const { initSns }: { initSns: InitSns } = await import(
    "@dfinity/sns/dist/esm/sns"
  );

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

  // TODO(L2-751): replace with effective implementation and types to get the metadata / summary
  // TODO(L2-830): we also want to have a status within each summary to display the information progressively
  const metadatas = await Promise.all(
    snsWrappers.map(({ metadata }: SnsWrapper) => metadata({ certified }))
  );

  // TODO(L2-829): mock data to be removed and replaced
  console.log("Sns metadatas", metadatas);

  if (mockSnsSummaries.length === 0) {
    mockSnsSummaries = snsWrappers.map(
      ({ canisterIds: { rootCanisterId } }: SnsWrapper) => ({
        ...mockSnsSummaryList[
          Math.floor(0 + Math.random() * (mockSnsSummaryList.length - 1))
        ],
        rootCanisterId,
      })
    );
  }

  logWithTimestamp(
    `Listing all deployed Sns summaries certified:${certified} done.`
  );

  return mockSnsSummaries;
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

  const summary = await metadata({ certified });

  logWithTimestamp(
    `Getting Sns ${rootCanisterId} summary certified:${certified} done.`
  );

  // TODO(L2-829, L2-751): remove and replace with effective data
  console.log("Sns metadata", summary);
  return mockAbout5SecondsWaiting(() =>
    mockSnsSummaries.find(
      ({ rootCanisterId: canisterId }: SnsSummary) =>
        canisterId.toText() === rootCanisterId
    )
  );
};
