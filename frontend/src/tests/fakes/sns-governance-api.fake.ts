import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import {
  installImplAndBlockRest,
  makePausable,
} from "$tests/utils/module.test-utils";
import { fromNullable, isNullish, toNullable } from "@dfinity/utils";
import type {
  SnsGovernanceDid,
  SnsListProposalsParams,
  SnsNeuronPermissionType,
} from "@icp-sdk/canisters/sns";
import { SnsGovernanceError, neuronSubaccount } from "@icp-sdk/canisters/sns";
import type { Identity } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";

const modulePath = "$lib/api/sns-governance.api";

const fakeFunctions = {
  querySnsNeurons,
  getSnsNeuron,
  nervousSystemParameters,
  getNeuronBalance,
  refreshNeuron,
  claimNeuron,
  queryProposals,
  queryProposal,
  addNeuronPermissions,
  removeNeuronPermissions,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

// Maps a key representing identity + rootCanisterId (`mapKey` function) to a list of neurons
const neurons: Map<string, SnsGovernanceDid.Neuron[]> = new Map();
// Maps a key representing identity + rootCanisterId (`mapKey` function) to a list of proposals
const proposals: Map<string, SnsGovernanceDid.ListProposalsResponse> =
  new Map();
// Maps a key representing rootCanisterId to a list of nervous system functions
const nervousFunctions: Map<string, SnsGovernanceDid.NervousSystemFunction[]> =
  new Map();

type KeyParams = {
  identity: Identity;
  rootCanisterId: Principal;
};

const mapKey = ({ identity, rootCanisterId }: KeyParams) =>
  JSON.stringify([identity.getPrincipal().toText(), rootCanisterId.toText()]);

const getNeurons = (keyParams: KeyParams) => {
  const key = mapKey(keyParams);
  let neuronList = neurons.get(key);
  if (isNullish(neuronList)) {
    neuronList = [];
    neurons.set(key, neuronList);
  }
  return neuronList;
};

const snsNeuronIdToHexString = (id: SnsGovernanceDid.NeuronId): string =>
  getSnsNeuronIdAsHexString({ ...mockSnsNeuron, id: [id] });

const getNeuron = ({
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsGovernanceDid.NeuronId;
}): SnsGovernanceDid.Neuron | undefined => {
  const neuronIdText = snsNeuronIdToHexString(neuronId);
  return getNeurons(keyParams).find(
    (neuron) => getSnsNeuronIdAsHexString(neuron) === neuronIdText
  );
};

const getNeuronOrThrow = (params: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsGovernanceDid.NeuronId;
}): SnsGovernanceDid.Neuron => {
  const neuron = getNeuron(params);
  if (isNullish(neuron)) {
    throw new SnsGovernanceError("No neuron for given NeuronId.");
  }
  return neuron;
};

// We update neuron permissions in place, so we need to copy the neurons when
// responding to API queries.
const copyNeuron = (neuron: SnsGovernanceDid.Neuron): SnsGovernanceDid.Neuron =>
  neuron && {
    ...neuron,
    permissions: neuron.permissions.map((entry) => ({ ...entry })),
  };

const getProposals = (
  keyParams: KeyParams
): SnsGovernanceDid.ListProposalsResponse => {
  const key = mapKey(keyParams);

  if (isNullish(proposals.get(key))) {
    proposals.set(key, {
      proposals: [],
      include_ballots_by_caller: [true],
      include_topic_filtering: [],
    });
  }
  return proposals.get(key);
};

const getNervousFunctions = (rootCanisterId: Principal) => {
  const key = rootCanisterId.toText();
  let nervousFunctionsList = nervousFunctions.get(key);
  if (isNullish(nervousFunctionsList)) {
    nervousFunctionsList = [];
    nervousFunctions.set(key, nervousFunctionsList);
  }
  return nervousFunctionsList;
};

const getOrCreateNeuronPrincipalPermissionEntry = ({
  principal,
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  principal: Principal;
  neuronId: SnsGovernanceDid.NeuronId;
}): { permission_type: Int32Array | number[] } => {
  const neuron = getNeuronOrThrow({ ...keyParams, neuronId });
  let permissionEntry = neuron.permissions.find(
    (entry) => fromNullable(entry.principal).toText() === principal.toText()
  );
  if (isNullish(permissionEntry)) {
    permissionEntry = {
      principal: toNullable(principal),
      permission_type: new Int32Array(),
    };
    neuron.permissions.push(permissionEntry);
  }
  return permissionEntry;
};

const getNeuronPrincipalPermissions = (entryParams: {
  identity: Identity;
  rootCanisterId: Principal;
  principal: Principal;
  neuronId: SnsGovernanceDid.NeuronId;
}): SnsNeuronPermissionType[] => {
  const entry = getOrCreateNeuronPrincipalPermissionEntry(entryParams);
  return Array.from(entry.permission_type);
};

const setNeuronPrincipalPermissions = ({
  permissions,
  ...entryParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  permissions: SnsNeuronPermissionType[];
  principal: Principal;
  neuronId: SnsGovernanceDid.NeuronId;
}) => {
  const entry = getOrCreateNeuronPrincipalPermissionEntry(entryParams);
  entry.permission_type = Int32Array.from(permissions);
};

////////////////////////
// Fake implementations:
////////////////////////

async function nervousSystemParameters({
  rootCanisterId: _,
  identity: __,
  certified: ___,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<SnsGovernanceDid.NervousSystemParameters> {
  return snsNervousSystemParametersMock;
}

async function getNeuronBalance({
  neuronId,
  rootCanisterId,
  certified,
  identity,
}: {
  neuronId: SnsGovernanceDid.NeuronId;
  rootCanisterId: Principal;
  certified: boolean;
  identity: Identity;
}): Promise<bigint> {
  const neuron = await querySnsNeuron({
    neuronId,
    rootCanisterId,
    certified,
    identity,
  });
  if (neuron) {
    // In reality the neuron balance can be different from the stake if
    // the user has made a transaction to increase the stake and the
    // neuron is not yet refreshed. But this is not yet implemented in
    // the fake.
    return neuron.cached_neuron_stake_e8s;
  }
  return 0n;
}

async function refreshNeuron(params: {
  rootCanisterId: Principal;
  identity: Identity;
  neuronId: SnsGovernanceDid.NeuronId;
}): Promise<void> {
  getNeuronOrThrow(params);
}

async function claimNeuron({
  rootCanisterId: _1,
  identity: _2,
  memo: _3,
  controller: _4,
  subaccount,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  memo: bigint;
  controller: Principal;
  subaccount: Uint8Array;
}): Promise<SnsGovernanceDid.NeuronId> {
  return { id: subaccount };
}

async function querySnsNeurons({
  identity,
  rootCanisterId,
  certified: _,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsGovernanceDid.Neuron[]> {
  return (neurons.get(mapKey({ identity, rootCanisterId })) || []).map(
    copyNeuron
  );
}

async function querySnsNeuron({
  certified: _,
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsGovernanceDid.NeuronId;
}): Promise<SnsGovernanceDid.Neuron | undefined> {
  return copyNeuron(getNeuron({ ...keyParams, neuronId }));
}

async function getSnsNeuron({
  certified: _,
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsGovernanceDid.NeuronId;
}): Promise<SnsGovernanceDid.Neuron> {
  return copyNeuron(getNeuronOrThrow({ ...keyParams, neuronId }));
}

async function queryProposals({
  identity,
  rootCanisterId,
  certified: _,
  params: __,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  params: SnsListProposalsParams;
}): Promise<SnsGovernanceDid.ListProposalsResponse> {
  return (
    proposals.get(mapKey({ identity, rootCanisterId })) || {
      proposals: [],
      include_ballots_by_caller: [true],
      include_topic_filtering: [],
    }
  );
}

/**
 * Throws if no proposal is found for the given proposalId.
 */
async function queryProposal({
  identity,
  rootCanisterId,
  certified: _,
  proposalId,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  proposalId: SnsGovernanceDid.ProposalId;
}): Promise<SnsGovernanceDid.ProposalData> {
  const proposal = proposals
    .get(mapKey({ identity, rootCanisterId }))
    ?.proposals.find(({ id }) => fromNullable(id).id === proposalId.id);
  if (isNullish(proposal)) {
    throw new SnsGovernanceError(
      `No proposal for given proposalId ${proposalId.id}`
    );
  }
  return proposal;
}

async function addNeuronPermissions({
  permissions,
  ...permissionEntryParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  permissions: SnsNeuronPermissionType[];
  principal: Principal;
  neuronId: SnsGovernanceDid.NeuronId;
}): Promise<void> {
  const currentPermissions = getNeuronPrincipalPermissions(
    permissionEntryParams
  );
  const newPermissions = Array.from(
    new Set([...currentPermissions, ...permissions])
  );
  setNeuronPrincipalPermissions({
    ...permissionEntryParams,
    permissions: newPermissions,
  });
}

async function removeNeuronPermissions({
  permissions,
  ...permissionEntryParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  permissions: SnsNeuronPermissionType[];
  principal: Principal;
  neuronId: SnsGovernanceDid.NeuronId;
}): Promise<void> {
  const currentPermissions = getNeuronPrincipalPermissions(
    permissionEntryParams
  );
  const toRemove = new Set(permissions);
  const newPermissions = currentPermissions.filter((p) => !toRemove.has(p));
  setNeuronPrincipalPermissions({
    ...permissionEntryParams,
    permissions: newPermissions,
  });
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const {
  pause,
  pauseFor,
  getPendingCount: getPendingCallsCount,
  resolvePending: resolvePendingCalls,
  resume,
  reset: resetPaused,
  pausableFunctions: implementedFunctions,
} = makePausable(fakeFunctions);

const reset = () => {
  neurons.clear();
  proposals.clear();
  nervousFunctions.clear();
  resetPaused();
};

export { getPendingCallsCount, pause, pauseFor, resolvePendingCalls, resume };

const createNeuronId = ({
  identity,
  index,
}: {
  identity: Identity;
  index: number;
}): SnsGovernanceDid.NeuronId => {
  const controller = identity.getPrincipal();
  const subaccount = neuronSubaccount({
    controller,
    index,
  });
  return { id: subaccount };
};

// This follows the same logic to determine neuron IDs as the real code because
// the real code will look for neurons with these IDs without even knowing if
// they exist.
const addNeuronToList = ({
  identity,
  rootCanisterId,
  overrideById,
  ...neuronParams
}: {
  identity?: Identity;
  rootCanisterId: Principal;
  overrideById?: boolean;
} & Partial<SnsGovernanceDid.Neuron>): SnsGovernanceDid.Neuron => {
  const currentNeurons = getNeurons({ identity, rootCanisterId });
  const index = currentNeurons.length;
  const defaultNeuronId = createNeuronId({ identity, index });
  const neuron: SnsGovernanceDid.Neuron = {
    ...mockSnsNeuron,
    id: [defaultNeuronId],
    ...neuronParams,
  };
  if (overrideById) {
    const newHexId = snsNeuronIdToHexString(neuron.id[0]);
    const filteredNeurons = currentNeurons.filter((currentNeuron) => {
      const currentHexId = snsNeuronIdToHexString(currentNeuron.id[0]);
      return currentHexId !== newHexId;
    });
    filteredNeurons.push(neuron);
    const key = mapKey({ identity, rootCanisterId });
    neurons.set(key, filteredNeurons);
  } else {
    currentNeurons.push(neuron);
  }
  return neuron;
};

export const addNeuronWith = ({
  identity = mockIdentity,
  rootCanisterId,
  ...neuronParams
}: {
  identity?: Identity;
  rootCanisterId: Principal;
} & Partial<SnsGovernanceDid.Neuron>): SnsGovernanceDid.Neuron => {
  return addNeuronToList({
    identity,
    rootCanisterId,
    overrideById: false,
    ...neuronParams,
  });
};

export const setNeuronWith = ({
  identity = mockIdentity,
  rootCanisterId,
  ...neuronParams
}: {
  identity?: Identity;
  rootCanisterId: Principal;
} & Partial<SnsGovernanceDid.Neuron>): SnsGovernanceDid.Neuron => {
  return addNeuronToList({
    identity,
    rootCanisterId,
    overrideById: true,
    ...neuronParams,
  });
};

export const addProposalWith = ({
  identity = mockIdentity,
  rootCanisterId,
  includeBallotsByCaller,
  ...proposalParams
}: {
  identity?: Identity;
  rootCanisterId: Principal;
  includeBallotsByCaller?: boolean;
} & Partial<SnsGovernanceDid.ProposalData>): SnsGovernanceDid.ProposalData => {
  const response = getProposals({
    identity,
    rootCanisterId,
  });
  const proposalsList = response.proposals;
  const index = proposalsList.length;
  const defaultProposalId = { id: BigInt(index + 1) };
  const proposal: SnsGovernanceDid.ProposalData = {
    ...mockSnsProposal,
    id: [defaultProposalId],
    ...proposalParams,
  };
  proposalsList.push(proposal);
  response.include_ballots_by_caller = [includeBallotsByCaller ?? true];

  return proposal;
};

export const addNervousSystemFunctionWith = ({
  rootCanisterId,
  ...functionParams
}: {
  rootCanisterId: Principal;
} & Partial<SnsGovernanceDid.NervousSystemFunction>): SnsGovernanceDid.NervousSystemFunction => {
  const nervousFunctions = getNervousFunctions(rootCanisterId);
  const index = nervousFunctions.length;
  const defaultFunctionId = BigInt(index + 1);
  const nervousFunction: SnsGovernanceDid.NervousSystemFunction = {
    ...nervousSystemFunctionMock,
    id: defaultFunctionId,
    ...functionParams,
  };
  nervousFunctions.push(nervousFunction);
  return nervousFunction;
};

// Call this inside a describe() block outside beforeEach() because it defines
// its own beforeEach() and afterEach().
export const install = (moduleObject?: unknown) => {
  beforeEach(() => {
    reset();
  });
  installImplAndBlockRest({
    modulePath,
    implementedFunctions,
    moduleObject,
  });
};
