import { logWithTimestamp } from "$lib/utils/dev.utils";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type {
  SnsListProposalsParams,
  SnsNervousSystemFunction,
  SnsNervousSystemParameters,
  SnsNeuron,
  SnsNeuronId,
  SnsNeuronPermissionType,
  SnsProposalId,
  SnsVote,
} from "@dfinity/sns";
import { wrapper } from "./sns-wrapper.api";

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

export const splitNeuron = async ({
  identity,
  rootCanisterId,
  neuronId,
  amount,
  memo,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
  amount: bigint;
  memo: bigint;
}): Promise<void> => {
  logWithTimestamp(`Split sns neuron call...`);

  const { splitNeuron } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await splitNeuron({
    neuronId,
    amount,
    memo,
  });

  logWithTimestamp(`Split sns neuron complete.`);
};

export const startDissolving = async ({
  identity,
  rootCanisterId,
  neuronId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp(`Start dissolving sns neuron call...`);

  const { startDissolving } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await startDissolving(neuronId);

  logWithTimestamp(`Start dissolving sns neuron complete.`);
};

export const stopDissolving = async ({
  identity,
  rootCanisterId,
  neuronId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp(`Stop dissolving sns neuron call...`);

  const { stopDissolving } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await stopDissolving(neuronId);

  logWithTimestamp(`Stop dissolving sns neuron complete.`);
};

export const setDissolveDelay = async ({
  identity,
  rootCanisterId,
  neuronId,
  dissolveTimestampSeconds,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
  dissolveTimestampSeconds: number;
}): Promise<void> => {
  logWithTimestamp(`Increase sns dissolve delay call...`);

  const { setDissolveTimestamp } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });
  await setDissolveTimestamp({
    neuronId,
    dissolveTimestampSeconds: BigInt(dissolveTimestampSeconds),
  });

  logWithTimestamp(`Increase sns dissolve delay complete.`);
};

export const getNeuronBalance = async ({
  neuronId,
  rootCanisterId,
  certified,
  identity,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  certified: boolean;
  identity: Identity;
}): Promise<bigint> => {
  logWithTimestamp(
    `Getting neuron ${subaccountToHexString(neuronId.id)} balance call...`
  );

  const { getNeuronBalance: getNeuronBalanceApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const balance = await getNeuronBalanceApi(neuronId);

  logWithTimestamp(
    `Getting neuron ${subaccountToHexString(
      neuronId.id
    )} balance call complete.`
  );
  return balance;
};

export const refreshNeuron = async ({
  rootCanisterId,
  identity,
  neuronId,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp(
    `Refreshing neuron ${subaccountToHexString(neuronId.id)} call...`
  );

  const { refreshNeuron: refreshNeuronApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await refreshNeuronApi(neuronId);

  logWithTimestamp(
    `Refreshing neuron ${subaccountToHexString(neuronId.id)} call complete.`
  );
};

export const claimNeuron = async ({
  rootCanisterId,
  identity,
  memo,
  controller,
  subaccount,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  memo: bigint;
  controller: Principal;
  subaccount: Uint8Array;
}): Promise<SnsNeuronId> => {
  logWithTimestamp(`Claiming neuron call...`);

  const { claimNeuron: claimNeuronApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const neuronId = await claimNeuronApi({
    subaccount,
    memo,
    controller,
  });

  logWithTimestamp(`Claiming neuron call complete.`);
  return neuronId;
};

export const getNervousSystemFunctions = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<SnsNervousSystemFunction[]> => {
  logWithTimestamp(`Getting nervous system functions call...`);

  const { listNervousSystemFunctions } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const { functions } = await listNervousSystemFunctions({});

  logWithTimestamp(`Getting nervous system functions call complete.`);
  return functions;
};

export const nervousSystemParameters = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<SnsNervousSystemParameters> => {
  logWithTimestamp(`Querying nervous system parameters...`);

  const { nervousSystemParameters: nervousSystemParametersApi } = await wrapper(
    {
      identity,
      rootCanisterId: rootCanisterId.toText(),
      certified,
    }
  );

  const parameters = await nervousSystemParametersApi({});

  logWithTimestamp(`Querying nervous system parameters complete.`);
  return parameters;
};

export const setFollowees = async ({
  rootCanisterId,
  identity,
  neuronId,
  functionId,
  followees,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  neuronId: SnsNeuronId;
  functionId: bigint;
  followees: SnsNeuronId[];
}): Promise<void> => {
  logWithTimestamp(`Setting sns neuron followee call...`);

  const { setTopicFollowees } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await setTopicFollowees({
    neuronId,
    functionId,
    followees,
  });

  logWithTimestamp(`Setting sns neuron followee call complete.`);
};

export const stakeMaturity = async ({
  neuronId,
  rootCanisterId,
  identity,
  percentageToStake,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  identity: Identity;
  percentageToStake: number;
}): Promise<void> => {
  logWithTimestamp(`Stake maturity: call...`);

  const { stakeMaturity: stakeMaturityApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await stakeMaturityApi({
    neuronId,
    percentageToStake,
  });

  logWithTimestamp(`Stake maturity: complete`);
};

export const disburseMaturity = async ({
  neuronId,
  rootCanisterId,
  identity,
  percentageToDisburse,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  identity: Identity;
  percentageToDisburse: number;
}): Promise<void> => {
  logWithTimestamp(`Disburse maturity: call...`);

  const { disburseMaturity: percentageToDisburseApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await percentageToDisburseApi({
    neuronId,
    percentageToDisburse,
  });

  logWithTimestamp(`Disburse maturity: complete`);
};

export const registerVote = async ({
  neuronId,
  rootCanisterId,
  identity,
  proposalId,
  vote,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  identity: Identity;
  proposalId: SnsProposalId;
  vote: SnsVote;
}): Promise<void> => {
  logWithTimestamp(`Register vote: call...`);

  const { registerVote: registerVoteApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await registerVoteApi({
    neuronId,
    proposalId,
    vote,
  });

  logWithTimestamp(`Register vote: complete`);
};

export const autoStakeMaturity = async ({
  neuronId,
  rootCanisterId,
  identity,
  autoStake,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  identity: Identity;
  autoStake: boolean;
}): Promise<void> => {
  logWithTimestamp(
    `${autoStake ? "Enable" : "Disable"} auto stake maturity call...`
  );

  const { autoStakeMaturity: autoStakeMaturityApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await autoStakeMaturityApi({
    neuronId,
    autoStake,
  });

  logWithTimestamp(
    `${autoStake ? "Enable" : "Disable"} auto stake maturity complete.`
  );
};

export const queryProposals = async ({
  rootCanisterId,
  identity,
  certified,
  params,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  params: SnsListProposalsParams;
}) => {
  logWithTimestamp(`Getting proposals call...`);

  const { listProposals } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const proposals = await listProposals(params);

  logWithTimestamp(`Getting proposals call complete.`);
  return proposals;
};

export const queryProposal = async ({
  rootCanisterId,
  identity,
  certified,
  proposalId,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  proposalId: SnsProposalId;
}) => {
  try {
    logWithTimestamp(`Getting proposal ${proposalId.id} call...`);

    const { getProposal } = await wrapper({
      identity,
      rootCanisterId: rootCanisterId.toText(),
      certified,
    });

    return getProposal({ proposalId });
  } finally {
    logWithTimestamp(`Getting proposal ${proposalId.id} call complete.`);
  }
};
