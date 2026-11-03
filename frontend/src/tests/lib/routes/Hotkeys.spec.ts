import * as governanceApi from "$lib/api/governance.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import Hotkeys from "$lib/routes/Hotkeys.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { HotkeysPo } from "$tests/page-objects/Hotkeys.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import type { Principal } from "@icp-sdk/core/principal";
import { render } from "@testing-library/svelte";

describe("Hotkeys", () => {
  const hotkeyA = principal(1);
  const hotkeyB = principal(2);
  const snsRootCanisterId = principal(10);
  const snsTitle = "SNS-1";

  const nnsNeuron = (neuronId: bigint, hotKeys: Principal[]): NeuronInfo => ({
    ...mockNeuron,
    neuronId,
    fullNeuron: {
      ...mockFullNeuron,
      id: neuronId,
      hotKeys: hotKeys.map((hotkey) => hotkey.toText()),
    },
  });

  const snsNeuron = (id: number, hotkeys: Principal[]) =>
    createMockSnsNeuron({
      id: [id],
      permissions: hotkeys.map((hotkey) => ({
        principal: [hotkey],
        permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
      })),
    });

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
    vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([]);
  });

  const renderComponent = () => {
    const { container } = render(Hotkeys);
    return HotkeysPo.under(new JestPageObjectElement(container));
  };

  it("should show skeleton rows while the neurons load", async () => {
    vi.spyOn(governanceApi, "queryNeurons").mockReturnValue(
      new Promise(() => {})
    );

    const po = renderComponent();
    await runResolvedPromises();

    expect(await po.isLoading()).toBe(true);
    expect(await po.hasEmptyState()).toBe(false);
  });

  it("should list the hotkeys of the NNS and SNS neurons", async () => {
    setSnsProjects([
      { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
    ]);
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([
      nnsNeuron(1n, [hotkeyA]),
      nnsNeuron(2n, [hotkeyA, hotkeyB]),
    ]);
    vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
      snsNeuron(1, [hotkeyA]),
    ]);

    const po = renderComponent();
    await runResolvedPromises();

    expect(await po.isLoading()).toBe(false);
    expect(await po.getRowsData()).toEqual([
      {
        principal: hotkeyA.toText(),
        projects: ["Internet Computer: 2", `${snsTitle}: 1`],
        neuronCount: "3",
      },
      {
        principal: hotkeyB.toText(),
        projects: ["Internet Computer: 1"],
        neuronCount: "1",
      },
    ]);
  });

  it("should not list the principal of the user", async () => {
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([
      nnsNeuron(1n, [mockIdentity.getPrincipal(), hotkeyA]),
    ]);

    const po = renderComponent();
    await runResolvedPromises();

    expect((await po.getRowsData()).map(({ principal }) => principal)).toEqual([
      hotkeyA.toText(),
    ]);
  });

  it("should show the empty state if the neurons have no hotkeys", async () => {
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([
      nnsNeuron(1n, []),
    ]);

    const po = renderComponent();
    await runResolvedPromises();

    expect(await po.hasEmptyState()).toBe(true);
  });

  it("should load the NNS neurons and the neurons of each SNS with certified data", async () => {
    setSnsProjects([
      { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
    ]);

    renderComponent();
    await runResolvedPromises();

    expect(governanceApi.queryNeurons).toHaveBeenCalledWith(
      expect.objectContaining({ certified: true })
    );
    expect(snsGovernanceApi.querySnsNeurons).toHaveBeenCalledWith({
      identity: mockIdentity,
      rootCanisterId: snsRootCanisterId,
      certified: true,
    });
  });

  it("should load the neurons of an SNS that loads after the page", async () => {
    renderComponent();
    await runResolvedPromises();

    expect(snsGovernanceApi.querySnsNeurons).not.toHaveBeenCalled();

    setSnsProjects([
      { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
    ]);
    await runResolvedPromises();

    expect(snsGovernanceApi.querySnsNeurons).toHaveBeenCalledWith(
      expect.objectContaining({ rootCanisterId: snsRootCanisterId })
    );
  });
});
