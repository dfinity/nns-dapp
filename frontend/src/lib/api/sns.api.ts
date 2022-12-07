import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import type { SnsSwapCommitment } from "$lib/types/sns";
import type {
  QueryRootCanisterId,
  QuerySnsMetadata,
  QuerySnsSwapState,
} from "$lib/types/sns.query";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import type { Identity } from "@dfinity/agent";
import type { TokenAmount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type {
  SnsAccount,
  SnsNeuron,
  SnsNeuronId,
  SnsSwapBuyerState,
  SnsWrapper,
} from "@dfinity/sns";
import { toNullable } from "@dfinity/utils";
import { ledgerCanister } from "./ledger.api";
import { nnsDappCanister } from "./nns-dapp.api";
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
    canisterIds: { swapCanisterId, governanceCanisterId },
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

export const participateInSnsSwap = async ({
  amount,
  controller,
  identity,
  rootCanisterId,
  fromSubAccount,
}: {
  amount: TokenAmount;
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

  // If the client disconnects after the tranfer, the participation will still be notified.
  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  await nnsDapp.addPendingNotifySwap({
    swap_canister_id: swapCanisterId,
    buyer: controller,
    buyer_sub_account: toNullable(fromSubAccount),
  });

  // Send amount to the ledger
  await nnsLedger.transfer({
    amount: amount.toE8s(),
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
  const neurons = await listNeurons({
    principal: identity.getPrincipal(),
  });

  logWithTimestamp("Getting sns neurons: done");
  return neurons;
};

/**
 * Returns the neuron or raises an error if not found.
 */
export const getSnsNeuron = async ({
  identity,
  rootCanisterId,
  certified,
  neuronId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsNeuronId;
}): Promise<SnsNeuron> => {
  logWithTimestamp("Getting sns neuron: call...");
  const { getNeuron } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });
  const neuron = await getNeuron({
    neuronId,
  });

  logWithTimestamp("Getting sns neuron: done");
  return neuron;
};

/**
 * Returns the neuron or undefined.
 */
export const querySnsNeuron = async ({
  identity,
  rootCanisterId,
  certified,
  neuronId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsNeuronId;
}): Promise<SnsNeuron | undefined> => {
  logWithTimestamp("Querying sns neuron: call...");
  const { queryNeuron } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });
  const neuron = await queryNeuron({
    neuronId,
  });

  logWithTimestamp("Getting sns neuron: done");
  return neuron;
};

export const stakeNeuron = async ({
  controller,
  stakeE8s,
  rootCanisterId,
  identity,
  source,
}: {
  controller: Principal;
  stakeE8s: bigint;
  rootCanisterId: Principal;
  identity: Identity;
  source: SnsAccount;
}): Promise<SnsNeuronId> => {
  logWithTimestamp(
    `Staking neuron with ${Number(stakeE8s) / E8S_PER_ICP}: call...`
  );

  const { stakeNeuron: stakeNeuronApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const newNeuronId = await stakeNeuronApi({
    stakeE8s,
    source,
    controller,
  });

  logWithTimestamp(
    `Staking neuron with ${Number(stakeE8s) / E8S_PER_ICP}: complete`
  );
  return newNeuronId;
};
