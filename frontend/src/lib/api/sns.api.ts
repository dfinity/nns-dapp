import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import type { SnsSwapCommitment } from "$lib/types/sns";
import type {
  QueryRootCanisterId,
  QuerySnsMetadata,
  QuerySnsSwapState,
} from "$lib/types/sns.query";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";
import type {
  SnsGetDerivedStateResponse,
  SnsGetLifecycleResponse,
  SnsNeuronId,
  SnsSwapBuyerState,
  SnsWrapper,
} from "@dfinity/sns";
import { wrapper, wrappers } from "./sns-wrapper.api";

export const queryAllSnsMetadata = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<QuerySnsMetadata[]> => {
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
  const metadata: (QuerySnsMetadata | undefined)[] = await Promise.all(
    snsWrappers.map(({ canisterIds: { rootCanisterId } }: SnsWrapper) =>
      querySnsMetadata({
        rootCanisterId: rootCanisterId.toText(),
        certified,
        identity,
      })
    )
  );

  logWithTimestamp(
    `Listing all deployed Sns summaries certified:${certified} done.`
  );

  return metadata.filter(
    (summary: QuerySnsMetadata | undefined) => summary !== undefined
  ) as QuerySnsMetadata[];
};

export const querySnsMetadata = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: QueryRootCanisterId;
  identity: Identity;
  certified: boolean;
}): Promise<QuerySnsMetadata | undefined> => {
  logWithTimestamp(
    `Getting Sns ${rootCanisterId} summary certified:${certified} call...`
  );

  const { metadata: meta }: SnsWrapper = await wrapper({
    rootCanisterId,
    identity,
    certified,
  });

  const [metadata, token] = await meta({});

  logWithTimestamp(
    `Getting Sns ${rootCanisterId} summary certified:${certified} done.`
  );

  return {
    metadata,
    token,
    certified,
    rootCanisterId,
  };
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
}): Promise<QuerySnsSwapState> => {
  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap state certified:${certified} call...`
  );

  const {
    swapState,
    canisterIds: {
      swapCanisterId,
      governanceCanisterId,
      ledgerCanisterId,
      indexCanisterId,
    },
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
    governanceCanisterId,
    ledgerCanisterId,
    indexCanisterId,
    swap,
    derived,
    certified,
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

export const querySnsDerivedState = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: QueryRootCanisterId;
  identity: Identity;
  certified: boolean;
}): Promise<SnsGetDerivedStateResponse | undefined> => {
  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap derived state certified:${certified} call...`
  );

  const { getDerivedState }: SnsWrapper = await wrapper({
    rootCanisterId,
    identity,
    certified,
  });

  const derivedState: SnsGetDerivedStateResponse | undefined =
    await getDerivedState({});

  logWithTimestamp(
    `Getting Sns ${rootCanisterId} swap derived state certified:${certified} done.`
  );

  return derivedState;
};

export const querySnsLifecycle = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: QueryRootCanisterId;
  identity: Identity;
  certified: boolean;
}): Promise<SnsGetLifecycleResponse | undefined> => {
  logWithTimestamp(
    `Getting Sns ${rootCanisterId} sale lifecycle certified:${certified} call...`
  );

  const { getLifecycle }: SnsWrapper = await wrapper({
    rootCanisterId,
    identity,
    certified,
  });

  const lifecycleResponse: SnsGetLifecycleResponse | undefined =
    await getLifecycle({});

  logWithTimestamp(
    `Getting Sns ${rootCanisterId} sale lifecycle certified:${certified} done.`
  );

  return lifecycleResponse;
};

/**
 * Stake SNS neuron.
 *
 * param.fee is mandatory to ensure that it's show for hardware wallets.
 * Otherwise, the fee would not show in the device and the user would not know how much they are paying.
 *
 * This als adds an extra layer of safety because we show the fee before the user confirms the transaction.
 */
export const stakeNeuron = async ({
  controller,
  stakeE8s,
  rootCanisterId,
  identity,
  source,
  fee,
}: {
  controller: Principal;
  stakeE8s: bigint;
  rootCanisterId: Principal;
  identity: Identity;
  source: IcrcAccount;
  fee: bigint;
}): Promise<SnsNeuronId> => {
  logWithTimestamp(
    `Staking neuron with ${Number(stakeE8s) / E8S_PER_ICP}: call...`
  );

  const { stakeNeuron: stakeNeuronApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const createdAt = nowInBigIntNanoSeconds();
  const newNeuronId = await stakeNeuronApi({
    stakeE8s,
    source,
    controller,
    createdAt,
    fee,
  });

  logWithTimestamp(
    `Staking neuron with ${Number(stakeE8s) / E8S_PER_ICP}: complete`
  );
  return newNeuronId;
};

export const increaseStakeNeuron = async ({
  neuronId,
  stakeE8s,
  rootCanisterId,
  identity,
  source,
}: {
  neuronId: SnsNeuronId;
  stakeE8s: bigint;
  rootCanisterId: Principal;
  identity: Identity;
  source: IcrcAccount;
}): Promise<void> => {
  logWithTimestamp(
    `Increase stake neuron with ${Number(stakeE8s) / E8S_PER_ICP}: call...`
  );

  const { increaseStakeNeuron: increaseStakeNeuronApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await increaseStakeNeuronApi({
    stakeE8s,
    source,
    neuronId,
  });

  logWithTimestamp(
    `Increase stake neuron with ${Number(stakeE8s) / E8S_PER_ICP}: complete`
  );
};
