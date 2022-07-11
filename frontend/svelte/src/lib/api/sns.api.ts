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

type RootCanisterId = Principal;
let snsWrappers: Map<RootCanisterId, SnsWrapper> | undefined;

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
 * @param agent
 * @return The list of root canister id of each deployed Sns project
 */
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

  // TODO(L2-828): extract property for wasm canister id

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

const initSns = async ({
  agent,
  rootCanisterId,
}: {
  agent: HttpAgent;
  rootCanisterId: Principal;
}): Promise<SnsWrapper> => {
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

const loadSnsWrappers = async ({
  identity,
}: {
  identity: Identity;
}): Promise<SnsWrapper[]> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const rootCanisterIds: Principal[] = await listSnses({ agent });

  const results: PromiseSettledResult<SnsWrapper>[] = await Promise.allSettled(
    rootCanisterIds.map((rootCanisterId: Principal) =>
      initSns({ agent, rootCanisterId })
    )
  );

  // TODO: filter errors

  return results
    .filter(({ status }) => status === "fulfilled")
    .map(({ value: wrapper }: PromiseFulfilledResult<SnsWrapper>) => wrapper);
};

const wrappers = async ({
  identity,
}: {
  identity: Identity;
}): Promise<Map<RootCanisterId, SnsWrapper>> => {
  if (!snsWrappers) {
    snsWrappers = new Map(
      (await loadSnsWrappers({ identity })).map((wrapper: SnsWrapper) => [
        wrapper.canisterIds.rootCanisterId,
        wrapper,
      ])
    );
  }

  return snsWrappers;
};

const wrapper = async ({
  identity,
  rootCanisterId,
}: {
  identity: Identity;
  rootCanisterId: RootCanisterId;
}): Promise<SnsWrapper> => {
  const snsWrapper: SnsWrapper | undefined = (await wrappers({ identity })).get(
    rootCanisterId
  );

  // TODO: proper error and docs
  if (snsWrapper === undefined) {
    throw new Error("Undefined sns wrapper");
  }

  return snsWrapper;
};

export const listSnsSummaries = async ({
  identity,
}: {
  identity: Identity;
}): Promise<SnsSummary[]> => {
  // TODO: query and update calls

  const snsWrappers: SnsWrapper[] = [
    ...(
      (await wrappers({ identity })) ?? new Map<RootCanisterId, SnsWrapper>()
    ).values(),
  ];

  // TODO(L2-751): replace with effective implementation and types to get the metadata / summary
  // TODO(L2-830): we also want to have a status within each summary to display the information progressively
  const result = await Promise.all(
    snsWrappers.map(({ metadata }: SnsWrapper) =>
      metadata({ certified: false })
    )
  );

  // TODO(L2-829): mock data to be removed and replaced
  console.log("Sns metadatas", result);
  return mockSnsSummaryList;
};

export const listSnsSummary = async ({
  rootCanisterId,
  identity,
}: {
  rootCanisterId: Principal;
  identity: Identity;
}): Promise<SnsSummary | undefined> => {
  // TODO: query and update calls

  const { metadata }: SnsWrapper = await wrapper({
    rootCanisterId,
    identity,
  });

  const summary = await metadata({ certified: false });

  // TODO(L2-829, L2-751): remove and replace with effective data
  console.log("Sns metadata", summary);
  return mockAbout5SecondsWaiting(() =>
    mockSnsSummaryList.find(
      ({ rootCanisterId: canisterId }: SnsSummary) =>
        canisterId.toText() === rootCanisterId.toText()
    )
  );
};
