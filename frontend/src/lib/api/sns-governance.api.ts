import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuronId, SnsNeuronPermissionType } from "@dfinity/sns";
import { wrapper } from "./sns-wrapper.api";

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
