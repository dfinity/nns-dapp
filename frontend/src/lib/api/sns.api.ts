import type { Identity } from "@dfinity/agent";
import type { ICP } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type {
  SnsNeuron,
  SnsNeuronId,
  SnsNeuronPermissionType,
  SnsSwapBuyerState,
  SnsWrapper,
} from "@dfinity/sns";
import { toNullable } from "@dfinity/utils";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import type { SnsSwapCommitment } from "../types/sns";
import type {
  QueryRootCanisterId,
  QuerySnsMetadata,
  QuerySnsSwapState,
} from "../types/sns.query";
import { logWithTimestamp } from "../utils/dev.utils";
import { getSwapCanisterAccount } from "../utils/sns.utils";
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

export const addNeuronPermissions = async ({
  identity,
  rootCanisterId,
  permissions,
  principal,
  neuronId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  permissions: SnsNeuronPermissionType[];
  principal: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp("Adding neuron permissions: call...");
  const { addNeuronPermissions } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });
  await addNeuronPermissions({
    permissions,
    principal,
    neuronId,
  });

  logWithTimestamp("Adding neuron permissions: done");
};

export const removeNeuronPermissions = async ({
  identity,
  rootCanisterId,
  permissions,
  principal,
  neuronId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  permissions: SnsNeuronPermissionType[];
  principal: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp("Removing neuron permissions: call...");
  const { removeNeuronPermissions } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });
  await removeNeuronPermissions({
    permissions,
    principal,
    neuronId,
  });

  logWithTimestamp("Removing neuron permissions: done");
};

export const disburse = async ({
  identity,
  rootCanisterId,
  neuronId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp(`Disburse sns neuron call...`);

  const { disburse } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await disburse({
    neuronId,
  });

  logWithTimestamp(`Disburse sns neuron complete.`);
};
