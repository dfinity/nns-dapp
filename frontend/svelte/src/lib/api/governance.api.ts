import type { HttpAgent, Identity } from "@dfinity/agent";
import type { KnownNeuron, NeuronId, NeuronInfo, Topic } from "@dfinity/nns";
import { GovernanceCanister, ICP, LedgerCanister } from "@dfinity/nns";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import {
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { createAgent } from "../utils/agent.utils";
import { dfinityNeuron, icNeuron } from "./constants.api";
import {
  addNodeToSubnetPayload,
  addOrRemoveDataCentersPayload,
  makeExecuteNnsFunctionDummyProposalRequest,
  makeMotionDummyProposalRequest,
  makeNetworkEconomicsDummyProposalRequest,
  makeRewardNodeProviderDummyProposal,
  updateSubnetConfigPayload,
  updateSubnetPayload,
} from "./dummyProposals.utils";
import { toSubAccountId } from "./utils.api";

export const queryNeuron = async ({
  neuronId,
  identity,
  certified,
}: {
  neuronId: NeuronId;
  identity: Identity;
  certified: boolean;
}): Promise<NeuronInfo | undefined> => {
  const { canister } = await governanceCanister({ identity });

  return canister.getNeuron({
    certified,
    principal: identity.getPrincipal(),
    neuronId,
  });
};

export const increaseDissolveDelay = async ({
  neuronId,
  dissolveDelayInSeconds,
  identity,
}: {
  neuronId: NeuronId;
  dissolveDelayInSeconds: number;
  identity: Identity;
}): Promise<void> => {
  const { canister } = await governanceCanister({ identity });

  return canister.increaseDissolveDelay({
    neuronId,
    additionalDissolveDelaySeconds: dissolveDelayInSeconds,
  });
};

export const joinCommunityFund = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  const { canister } = await governanceCanister({ identity });

  return canister.joinCommunityFund(neuronId);
};

export const startDissolving = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  const { canister } = await governanceCanister({ identity });

  return canister.startDissolving(neuronId);
};

export const stopDissolving = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  const { canister } = await governanceCanister({ identity });

  return canister.stopDissolving(neuronId);
};

export const setFollowees = async ({
  identity,
  neuronId,
  topic,
  followees,
}: {
  identity: Identity;
  neuronId: NeuronId;
  topic: Topic;
  followees: NeuronId[];
}): Promise<void> => {
  const { canister } = await governanceCanister({ identity });

  return canister.setFollowees({
    neuronId,
    topic,
    followees,
  });
};

export const queryNeurons = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<NeuronInfo[]> => {
  const { canister } = await governanceCanister({ identity });

  return canister.listNeurons({
    certified,
    principal: identity.getPrincipal(),
  });
};

/**
 * Uses governance and ledger canisters to create a neuron
 */
export const stakeNeuron = async ({
  stake,
  identity,
  fromSubAccount,
}: {
  stake: ICP;
  identity: Identity;
  fromSubAccount?: SubAccountArray;
}): Promise<NeuronId> => {
  const { canister, agent } = await governanceCanister({ identity });

  const ledgerCanister: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  const fromSubAccountId =
    fromSubAccount !== undefined ? toSubAccountId(fromSubAccount) : undefined;

  return canister.stakeNeuron({
    stake,
    principal: identity.getPrincipal(),
    fromSubAccountId,
    ledgerCanister,
  });
};

export const queryKnownNeurons = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<KnownNeuron[]> => {
  const { canister } = await governanceCanister({ identity });

  const knownNeurons = await canister.listKnownNeurons(certified);

  if (knownNeurons.find(({ id }) => id === dfinityNeuron.id) === undefined) {
    knownNeurons.push(dfinityNeuron);
  }

  if (knownNeurons.find(({ id }) => id === icNeuron.id) === undefined) {
    knownNeurons.push(icNeuron);
  }

  return knownNeurons;
};

export const claimOrRefreshNeuron = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<NeuronId | undefined> => {
  const { canister } = await governanceCanister({ identity });

  return canister.claimOrRefreshNeuron({
    neuronId,
    by: { NeuronIdOrSubaccount: {} },
  });
};

export const makeDummyProposals = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  const { canister } = await governanceCanister({ identity });
  try {
    // Used only on testnet
    // We do one by one, in case one fails, we don't do the others.
    const request1 = makeMotionDummyProposalRequest({
      title: "Test proposal title - Lower all prices!",
      neuronId,
      url: "http://free-stuff-for-all.com",
      summary: "Change the world with the IC - lower all prices!",
    });
    console.log("Motion Proposal...");
    await canister.makeProposal(request1);
    const request2 = makeNetworkEconomicsDummyProposalRequest({
      neuronId,
      title: "Increase minimum neuron stake",
      url: "https://www.lipsum.com/",
      summary: "Increase minimum neuron stake",
    });
    console.log("Netowrk Economics Proposal...");
    await canister.makeProposal(request2);
    const request3 = makeRewardNodeProviderDummyProposal({
      neuronId,
      url: "https://www.lipsum.com/",
      title: "Reward for Node Provider 'ABC'",
      summary: "Reward for Node Provider 'ABC'",
    });
    console.log("Rewards Node Provide Proposal...");
    await canister.makeProposal(request3);
    const request4 = makeExecuteNnsFunctionDummyProposalRequest({
      neuronId,
      title: "Add node(s) to subnet 10",
      url: "https://github.com/ic-association/nns-proposals/blob/main/proposals/subnet_management/20210928T1140Z.md",
      summary: "Add node(s) to subnet 10",
      nnsFunction: 2,
      payload: addNodeToSubnetPayload,
    });
    console.log("Execute NNS Function Proposal...");
    await canister.makeProposal(request4);
    const request5 = makeExecuteNnsFunctionDummyProposalRequest({
      neuronId,
      title: "Update configuration of subnet: tdb26-",
      url: "",
      summary:
        "Update the NNS subnet tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe in order to grant backup access to three backup pods operated by the DFINITY Foundation. The backup user has only read-only access to the recent blockchain artifacts.",
      nnsFunction: 7,
      payload: updateSubnetConfigPayload,
    });
    console.log("Execute NNS Function Proposal...");
    await canister.makeProposal(request5);
    const request6 = makeExecuteNnsFunctionDummyProposalRequest({
      neuronId,
      title:
        "Update subnet shefu-t3kr5-t5q3w-mqmdq-jabyv-vyvtf-cyyey-3kmo4-toyln-emubw-4qe to version 3eaf8541c389badbd6cd50fff31e158505f4487d",
      url: "https://github.com/ic-association/nns-proposals/blob/main/proposals/subnet_management/20210930T0728Z.md",
      summary:
        "Update subnet shefu-t3kr5-t5q3w-mqmdq-jabyv-vyvtf-cyyey-3kmo4-toyln-emubw-4qe to version 3eaf8541c389badbd6cd50fff31e158505f4487d",
      nnsFunction: 11,
      payload: updateSubnetPayload,
    });
    console.log("Execute NNS Function Proposal...");
    await canister.makeProposal(request6);
    const request7 = makeExecuteNnsFunctionDummyProposalRequest({
      neuronId,
      title: "Initialize datacenter records",
      url: "",
      summary:
        "Initialize datacenter records. For more info about this proposal, read the forum announcement: https://forum.dfinity.org/t/improvements-to-node-provider-remuneration/10553",
      nnsFunction: 21,
      payload: addOrRemoveDataCentersPayload,
    });
    console.log("Execute NNS Function Proposal...");
    await canister.makeProposal(request7);
    console.log("Finished making dummy proposals");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

// TODO: Apply pattern to other canister instantiation L2-371
const governanceCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: GovernanceCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({
    identity,
    host: process.env.HOST,
  });

  const canister = GovernanceCanister.create({
    agent,
    canisterId: GOVERNANCE_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
