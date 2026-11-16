import * as governanceApi from "$lib/api/governance.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import Hotkeys from "$lib/routes/Hotkeys.svelte";
import * as hotkeysServices from "$lib/services/hotkeys.services";
import { listNeurons } from "$lib/services/neurons.services";
import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ChangeHotkeyModalPo } from "$tests/page-objects/ChangeHotkeyModal.page-object";
import { HotkeysPo } from "$tests/page-objects/Hotkeys.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import {
  SnsNeuronPermissionType,
  type SnsGovernanceDid,
} from "@icp-sdk/canisters/sns";
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

  it("should render the column headers", async () => {
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([
      nnsNeuron(1n, [hotkeyA]),
    ]);

    const po = renderComponent();
    await runResolvedPromises();

    expect(await po.getResponsiveTablePo().getDesktopColumnHeaders()).toEqual([
      "Hotkey",
      "Projects",
      "Neurons",
      "",
    ]);
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
    setSnsProjects([]);
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([
      nnsNeuron(1n, []),
    ]);

    const po = renderComponent();
    await runResolvedPromises();

    expect(await po.hasEmptyState()).toBe(true);
  });

  it("should wait for the SNS projects before it shows the empty state", async () => {
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);

    const po = renderComponent();
    await runResolvedPromises();

    expect(await po.hasEmptyState()).toBe(false);
    expect(await po.isLoading()).toBe(true);

    setSnsProjects([
      { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
    ]);
    await runResolvedPromises();

    expect(await po.hasEmptyState()).toBe(true);
  });

  describe("actions", () => {
    const controlledNeuron: NeuronInfo = {
      ...nnsNeuron(1n, [hotkeyA]),
      fullNeuron: {
        ...nnsNeuron(1n, [hotkeyA]).fullNeuron,
        controller: mockIdentity.getPrincipal().toText(),
      },
    };

    beforeEach(() => {
      vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([
        controlledNeuron,
      ]);
      vi.spyOn(hotkeysServices, "changeHotkeyOnNeurons").mockImplementation(
        async ({ neurons }) =>
          neurons.map((neuron) => ({ ...neuron, success: true }))
      );
    });

    // The SNS neuron query has no cache, so each load calls the API.
    const snsNeuronOfUser = createMockSnsNeuron({
      id: [1],
      permissions: [
        {
          principal: [mockIdentity.getPrincipal()],
          permission_type: Int32Array.from([
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_PRINCIPALS,
          ]),
        },
        {
          principal: [hotkeyA],
          permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
        },
      ],
    });

    const removeSnsHotkeyA = async () => {
      setSnsProjects([
        { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
      ]);
      vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
      const { container } = render(Hotkeys);
      const po = HotkeysPo.under(new JestPageObjectElement(container));
      await runResolvedPromises();

      await po.clickRemove(0);
      await ChangeHotkeyModalPo.under(
        new JestPageObjectElement(container)
      ).clickConfirm();
      await runResolvedPromises();
      return po;
    };

    it("should load the changed neurons again after a change", async () => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        snsNeuronOfUser,
      ]);

      await removeSnsHotkeyA();

      expect(hotkeysServices.changeHotkeyOnNeurons).toHaveBeenCalledWith({
        change: { type: "remove", principal: hotkeyA.toText() },
        neurons: [
          {
            universeId: snsRootCanisterId.toText(),
            neuronId: getSnsNeuronIdAsHexString(snsNeuronOfUser),
          },
        ],
      });
      expect(snsGovernanceApi.querySnsNeurons).toHaveBeenCalledTimes(2);
    });

    it("should show the load error if the neurons do not load after a change", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      vi.spyOn(snsGovernanceApi, "querySnsNeurons")
        .mockResolvedValueOnce([snsNeuronOfUser])
        .mockRejectedValue(new Error("SNS neurons failed"));

      const po = await removeSnsHotkeyA();

      expect(await po.hasLoadError()).toBe(true);
    });

    it("should disable the actions while the neurons load", async () => {
      setSnsProjects([
        { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
      ]);
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        snsNeuronOfUser,
      ]);
      let resolveNnsNeurons: (neurons: NeuronInfo[]) => void;
      vi.spyOn(governanceApi, "queryNeurons").mockReturnValue(
        new Promise((resolve) => {
          resolveNnsNeurons = resolve;
        })
      );

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.areActionsDisabled(0)).toEqual([true, true]);

      resolveNnsNeurons([]);
      await runResolvedPromises();

      expect(await po.areActionsDisabled(0)).toEqual([false, false]);
    });

    it("should open the Replace modal for the hotkey", async () => {
      const { container } = render(Hotkeys);
      const po = HotkeysPo.under(new JestPageObjectElement(container));
      await runResolvedPromises();

      await po.clickReplace(0);

      const modalPo = ChangeHotkeyModalPo.under(
        new JestPageObjectElement(container)
      );
      expect(await modalPo.getModalTitle()).toBe("Replace Hotkey");
      expect(await modalPo.getCurrentHotkey()).toBe(hotkeyA.toText());
    });

    it("should open the Remove modal for the hotkey", async () => {
      const { container } = render(Hotkeys);
      const po = HotkeysPo.under(new JestPageObjectElement(container));
      await runResolvedPromises();

      await po.clickRemove(0);

      const modalPo = ChangeHotkeyModalPo.under(
        new JestPageObjectElement(container)
      );
      expect(await modalPo.getModalTitle()).toBe("Remove Hotkey");
      expect(await modalPo.getCurrentHotkey()).toBe(hotkeyA.toText());

      await modalPo.closeModal();
      await modalPo.waitForClosed();
    });
  });

  it("should not show a removed hotkey again when an older neuron load ends after the change", async () => {
    setSnsProjects([]);
    vi.spyOn(governanceApi, "removeHotkey").mockResolvedValue();
    const neuronWithHotkey: NeuronInfo = {
      ...nnsNeuron(1n, [hotkeyA]),
      fullNeuron: {
        ...nnsNeuron(1n, [hotkeyA]).fullNeuron,
        controller: mockIdentity.getPrincipal().toText(),
      },
    };
    const neuronWithoutHotkey: NeuronInfo = {
      ...neuronWithHotkey,
      fullNeuron: { ...neuronWithHotkey.fullNeuron, hotKeys: [] },
    };
    // Calls 1 and 2: the query and update calls of a load that a previous
    // page started. Calls 3 and 4: the page load and the load before the
    // change. Then the load after the change.
    const olderResponses: Array<(neurons: NeuronInfo[]) => void> = [];
    let calls = 0;
    vi.spyOn(governanceApi, "queryNeurons").mockImplementation(() => {
      calls += 1;
      if (calls <= 2) {
        return new Promise((resolve) => olderResponses.push(resolve));
      }
      return Promise.resolve(
        calls <= 4 ? [neuronWithHotkey] : [neuronWithoutHotkey]
      );
    });

    listNeurons();
    const { container } = render(Hotkeys);
    const po = HotkeysPo.under(new JestPageObjectElement(container));
    await runResolvedPromises();
    expect((await po.getRowsData()).map(({ principal }) => principal)).toEqual([
      hotkeyA.toText(),
    ]);

    await po.clickRemove(0);
    await ChangeHotkeyModalPo.under(
      new JestPageObjectElement(container)
    ).clickConfirm();
    await runResolvedPromises();
    expect(await po.hasEmptyState()).toBe(true);

    olderResponses.forEach((resolve) => resolve([neuronWithHotkey]));
    await runResolvedPromises();

    expect(await po.hasEmptyState()).toBe(true);
  });

  it("should not show a removed SNS hotkey again when an older SNS neuron load ends after the change", async () => {
    setSnsProjects([
      { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
    ]);
    vi.spyOn(snsGovernanceApi, "removeNeuronPermissions").mockResolvedValue();
    const userPermission = {
      principal: [mockIdentity.getPrincipal()] as [Principal],
      permission_type: Int32Array.from([
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_PRINCIPALS,
      ]),
    };
    const neuronWithHotkey = createMockSnsNeuron({
      id: [1],
      permissions: [
        userPermission,
        {
          principal: [hotkeyA],
          permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
        },
      ],
    });
    const neuronWithoutHotkey = createMockSnsNeuron({
      id: [1],
      permissions: [userPermission],
    });
    // Calls 1 and 2: the query and update calls of a load that a previous
    // page started. Calls 3 and 4: the page load and the load before the
    // change. Then the load after the change.
    const olderResponses: Array<(neurons: SnsGovernanceDid.Neuron[]) => void> =
      [];
    let calls = 0;
    vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockImplementation(() => {
      calls += 1;
      if (calls <= 2) {
        return new Promise((resolve) => olderResponses.push(resolve));
      }
      return Promise.resolve(
        calls <= 4 ? [neuronWithHotkey] : [neuronWithoutHotkey]
      );
    });

    syncSnsNeurons(snsRootCanisterId);
    const { container } = render(Hotkeys);
    const po = HotkeysPo.under(new JestPageObjectElement(container));
    await runResolvedPromises();
    expect((await po.getRowsData()).map(({ principal }) => principal)).toEqual([
      hotkeyA.toText(),
    ]);

    await po.clickRemove(0);
    await ChangeHotkeyModalPo.under(
      new JestPageObjectElement(container)
    ).clickConfirm();
    await runResolvedPromises();
    expect(await po.hasEmptyState()).toBe(true);

    olderResponses.forEach((resolve) => resolve([neuronWithHotkey]));
    await runResolvedPromises();

    expect(await po.hasEmptyState()).toBe(true);
  });

  it("should keep its certified neurons when a query-only load ends during the page load", async () => {
    setSnsProjects([]);
    let resolveCertified: (neurons: NeuronInfo[]) => void;
    vi.spyOn(governanceApi, "queryNeurons").mockImplementation(
      ({ certified }) =>
        certified
          ? new Promise((resolve) => {
              resolveCertified = resolve;
            })
          : Promise.resolve([nnsNeuron(1n, [hotkeyB])])
    );

    const po = renderComponent();
    await runResolvedPromises();
    // The query-only fallback of the actionable proposals.
    await listNeurons({ strategy: "query" });
    resolveCertified([nnsNeuron(1n, [hotkeyA])]);
    await runResolvedPromises();

    expect(await po.isLoading()).toBe(false);
    expect(await po.hasLoadError()).toBe(false);
    // The row of the query-only data leaves with a transition.
    await vi.waitFor(async () =>
      expect(
        (await po.getRowsData()).map(({ principal }) => principal)
      ).toEqual([hotkeyA.toText()])
    );
  });

  describe("when a certified load fails", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should show an error instead of the empty state if the NNS neurons fail to load", async () => {
      setSnsProjects([]);
      vi.spyOn(governanceApi, "queryNeurons").mockRejectedValue(
        new Error("NNS neurons failed")
      );

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.hasLoadError()).toBe(true);
      expect(await po.hasEmptyState()).toBe(false);
    });

    it("should keep the hotkeys that loaded if the neurons of an SNS fail to load", async () => {
      setSnsProjects([
        { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
      ]);
      vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([
        nnsNeuron(1n, [hotkeyB]),
      ]);
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockRejectedValue(
        new Error("SNS neurons failed")
      );

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.hasLoadError()).toBe(true);
      expect(
        (await po.getRowsData()).map(({ principal }) => principal)
      ).toEqual([hotkeyB.toText()]);
    });

    it("should load the failed neurons again on retry", async () => {
      setSnsProjects([
        { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
      ]);
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockRejectedValue(
        new Error("SNS neurons failed")
      );

      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.hasLoadError()).toBe(true);
      expect(governanceApi.queryNeurons).toHaveBeenCalledTimes(1);

      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        snsNeuron(1, [hotkeyA]),
      ]);
      await po.clickRetry();
      await runResolvedPromises();

      expect(await po.hasLoadError()).toBe(false);
      expect(await po.getRowsData()).toEqual([
        {
          principal: hotkeyA.toText(),
          projects: [`${snsTitle}: 1`],
          neuronCount: "1",
        },
      ]);
      // Only the failed source loads again.
      expect(governanceApi.queryNeurons).toHaveBeenCalledTimes(1);
    });
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
    expect(governanceApi.queryNeurons).not.toHaveBeenCalledWith(
      expect.objectContaining({ certified: false })
    );
    expect(snsGovernanceApi.querySnsNeurons).not.toHaveBeenCalledWith(
      expect.objectContaining({ certified: false })
    );
  });

  it("should wait for the certified NNS neurons before it shows the empty state", async () => {
    setSnsProjects([]);
    let resolveNnsNeurons: (neurons: NeuronInfo[]) => void;
    vi.spyOn(governanceApi, "queryNeurons").mockImplementation(
      ({ certified }) =>
        certified
          ? new Promise((resolve) => {
              resolveNnsNeurons = resolve;
            })
          : Promise.resolve([])
    );

    const po = renderComponent();
    await runResolvedPromises();

    expect(await po.hasEmptyState()).toBe(false);
    expect(await po.isLoading()).toBe(true);

    resolveNnsNeurons([nnsNeuron(1n, [hotkeyA])]);
    await runResolvedPromises();

    expect(await po.getRowsData()).toEqual([
      {
        principal: hotkeyA.toText(),
        projects: ["Internet Computer: 1"],
        neuronCount: "1",
      },
    ]);
  });

  it("should wait for the certified SNS neurons before it shows the empty state", async () => {
    setSnsProjects([
      { rootCanisterId: snsRootCanisterId, projectName: snsTitle },
    ]);
    let resolveSnsNeurons: (neurons: SnsGovernanceDid.Neuron[]) => void;
    vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockImplementation(
      ({ certified }) =>
        certified
          ? new Promise((resolve) => {
              resolveSnsNeurons = resolve;
            })
          : Promise.resolve([])
    );

    const po = renderComponent();
    await runResolvedPromises();

    expect(await po.hasEmptyState()).toBe(false);
    expect(await po.isLoading()).toBe(true);

    resolveSnsNeurons([snsNeuron(1, [hotkeyA])]);
    await runResolvedPromises();

    expect(await po.getRowsData()).toEqual([
      {
        principal: hotkeyA.toText(),
        projects: [`${snsTitle}: 1`],
        neuronCount: "1",
      },
    ]);
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
