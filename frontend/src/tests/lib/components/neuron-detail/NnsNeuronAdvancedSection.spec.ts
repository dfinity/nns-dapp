/**
 * @jest-environment jsdom
 */

import NnsNeuronAdvancedSection from "$lib/components/neuron-detail/NnsNeuronAdvancedSection.svelte";
import { SECONDS_IN_MONTH } from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { NnsNeuronAdvancedSectionPo } from "$tests/page-objects/NnsNeuronAdvancedSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsNeuronAdvancedSection", () => {
  const identityMainAccount = {
    ...mockMainAccount,
    principal: mockIdentity.getPrincipal(),
  };
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronAdvancedSection,
      },
    });

    return NnsNeuronAdvancedSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    nnsLatestRewardEventStore.reset();
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    icpAccountsStore.resetForTesting();
  });

  it("should render neuron data", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      neuronId: 12345n,
      createdTimestampSeconds: 1689666271n,
      ageSeconds: BigInt(SECONDS_IN_MONTH),
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        agingSinceTimestampSeconds: BigInt(SECONDS_IN_MONTH),
        accountIdentifier: mockSubAccount.identifier,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.neuronId()).toBe("12345");
    expect(normalizeWhitespace(await po.neuronCreated())).toBe(
      "Jul 18, 2023 7:44 AM"
    );
    expect(await po.neuronAge()).toBe("30 days, 10 hours");
    expect(await po.neuronAccount()).toBe("d0654c5...2ff9f32");
  });

  it("should render last rewards distribution", async () => {
    const rewardEvent = {
      ...mockRewardEvent,
      actual_timestamp_seconds: BigInt(
        new Date("1992-05-22T21:00:00").getTime() / 1000
      ),
      rounds_since_last_distribution: [3n] as [bigint],
    };
    nnsLatestRewardEventStore.setLatestRewardEvent({
      rewardEvent,
      certified: true,
    });

    const po = renderComponent(mockNeuron);

    expect(await po.lastRewardsDistribution()).toBe("May 19, 1992");
  });

  it("should render actions if user is the controller", async () => {
    icpAccountsStore.setForTesting({
      main: identityMainAccount,
      subAccounts: [],
      hardwareWallets: [],
    });
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockIdentity.getPrincipal().toText(),
      },
    });

    expect(await po.hasStakeMaturityCheckbox()).toBe(true);
    expect(await po.hasJoinNeuronsFundCheckbox()).toBe(true);
    expect(await po.hasSplitNeuronButton()).toBe(true);
  });

  it("should not render split neuron action if user is not the controller", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockCanisterId.toText(),
      },
    });

    expect(await po.hasSplitNeuronButton()).toBe(false);
  });

  it("should not render join neurons' fund if user is not the controller", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockCanisterId.toText(),
      },
    });

    expect(await po.getJoinNeuronsFundCheckbox().isPresent()).toBe(false);
  });

  it("should render split button but not join neurons' fund if user is controlled by hardware wallet", async () => {
    icpAccountsStore.setForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [mockHardwareWalletAccount],
    });
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockHardwareWalletAccount.principal.toText(),
      },
    });

    expect(await po.getJoinNeuronsFundCheckbox().isPresent()).toBe(false);
    expect(await po.hasSplitNeuronButton()).toBe(true);
  });
});
