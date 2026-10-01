import SnsPermissionsCard from "$lib/components/neuron-detail/SnsPermissionsCard.svelte";
import type { SelectedSnsNeuronStore } from "$lib/types/sns-neuron-detail.context";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import {
  SnsNeuronPermissionType,
  type SnsGovernanceDid,
} from "@icp-sdk/canisters/sns";
import { Principal } from "@icp-sdk/core/principal";
import { writable } from "svelte/store";

describe("SnsPermissionsCard", () => {
  const hotkey =
    "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe";

  const permissionsFor = (
    permissions: SnsNeuronPermissionType[]
  ): SnsGovernanceDid.NeuronPermission => ({
    principal: [Principal.fromText(hotkey)] as [Principal],
    permission_type: Int32Array.from(permissions),
  });

  const neuronWith = (
    permissions: SnsNeuronPermissionType[]
  ): SnsGovernanceDid.Neuron => ({
    ...mockSnsNeuron,
    permissions: [permissionsFor(permissions)],
  });

  const hotkeyPermissions = [
    SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
    SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
  ];

  // The card renders one `TagsList` for each permission entry of the neuron.
  // Each list holds one tag for each permission of that principal.
  const renderedPermissions = (container: HTMLElement): string[][] =>
    Array.from(
      container.querySelectorAll('ul[aria-labelledby="permissions"]')
    ).map((list) =>
      Array.from(list.querySelectorAll("li")).map((tag) =>
        tag.textContent.trim()
      )
    );

  const renderCard = (neuron: SnsGovernanceDid.Neuron) => {
    const store = writable<SelectedSnsNeuronStore>({
      selected: {
        neuronIdHex: getSnsNeuronIdAsHexString(neuron),
        rootCanisterId: rootCanisterIdMock,
      },
      neuron,
    });
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsPermissionsCard,
      neuron,
      reload: vi.fn(),
      store,
    });
    return { container, store };
  };

  it("renders the permissions of the neuron", () => {
    const { container } = renderCard(neuronWith(hotkeyPermissions));

    expect(renderedPermissions(container)).toEqual([
      ["NEURON_PERMISSION_TYPE_VOTE", "NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL"],
    ]);
  });

  it("updates when the store gets a new neuron", async () => {
    const { container, store } = renderCard(neuronWith(hotkeyPermissions));

    expect(renderedPermissions(container)).toEqual([
      ["NEURON_PERMISSION_TYPE_VOTE", "NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL"],
    ]);

    store.update((value) => ({
      ...value,
      neuron: neuronWith([
        ...hotkeyPermissions,
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
      ]),
    }));
    await runResolvedPromises();

    expect(renderedPermissions(container)).toEqual([
      [
        "NEURON_PERMISSION_TYPE_VOTE",
        "NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL",
        "NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION",
      ],
    ]);
  });

  it("drops a principal that the new neuron no longer holds", async () => {
    const { container, store } = renderCard(neuronWith(hotkeyPermissions));

    expect(renderedPermissions(container)).toHaveLength(1);

    store.update((value) => ({
      ...value,
      neuron: { ...mockSnsNeuron, permissions: [] },
    }));
    await runResolvedPromises();

    expect(renderedPermissions(container)).toEqual([]);
  });
});
