import NnsNeuronAdvancedSection from "$lib/components/neuron-detail/NnsNeuronAdvancedSection.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
import { stakingRewardsStore } from "$lib/stores/staking-rewards.store";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { createMockNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { NnsNeuronAdvancedSectionPo } from "$tests/page-objects/NnsNeuronAdvancedSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronAdvancedSection", () => {
  const nowInSeconds = new Date("Jul 20, 2023 8:53 AM").getTime() / 1000;
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
    vi.useFakeTimers();
    vi.setSystemTime(nowInSeconds * 1000);
    resetIdentity();
  });

  it("should render neuron data", async () => {
    const neuronAccountIdentifier = mockSubAccount.identifier;
    const neuron: NeuronInfo = {
      ...mockNeuron,
      neuronId: 12345n,
      createdTimestampSeconds: 1689666271n,
      ageSeconds: BigInt(SECONDS_IN_MONTH),
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        agingSinceTimestampSeconds: BigInt(SECONDS_IN_MONTH),
        accountIdentifier: neuronAccountIdentifier,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.neuronId()).toBe("12345");
    expect(normalizeWhitespace(await po.neuronCreated())).toBe(
      "Jul 18, 2023 7:44 AM"
    );
    expect(await po.neuronAge()).toBe("30 days, 10 hours");
    expect(await po.neuronAccount()).toBe(neuronAccountIdentifier);
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

  it("should render APY values", async () => {
    const neuronId = 123n;
    const neuron: NeuronInfo = {
      ...mockNeuron,
      neuronId,
    };
    stakingRewardsStore.set({
      loading: false,
      rewardBalanceUSD: 100,
      rewardEstimateWeekUSD: 10,
      stakingPower: 1,
      stakingPowerUSD: 1,
      apy: new Map([
        [
          OWN_CANISTER_ID_TEXT,
          {
            cur: 0.1,
            max: 0.2,
            neurons: new Map([[neuronId.toString(), { cur: 0.01, max: 0.5 }]]),
          },
        ],
      ]),
    });

    const po = renderComponent(neuron);

    expect(await po.getCurrentApy()).toBe("1.00%");
    expect(await po.getMaxApy()).includes("50.00%");
  });

  it("should render actions if user is the controller", async () => {
    setAccountsForTesting({
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

  it("should render enabled join neurons' fund if user is the controller", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [],
    });
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockMainAccount.principal.toText(),
      },
    });

    expect(
      await po.getJoinNeuronsFundCheckbox().getAttribute("disabled")
    ).toBeNull();
  });

  it("should render enabled join neurons' fund if user is hotkey", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [],
    });
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "not-user",
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    });

    expect(
      await po.getJoinNeuronsFundCheckbox().getAttribute("disabled")
    ).toBeNull();
  });

  it("should render not render join neurons' fund if user is a hotkey but controller is the attached Ledger device", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [mockHardwareWalletAccount],
    });
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockHardwareWalletAccount.principal.toText(),
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    });

    expect(await po.getJoinNeuronsFundCheckbox().isPresent()).toBe(false);
  });

  it("should render not render join neurons' fund if user is not the controller nor a hotkey", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "not-user",
        hotKeys: [],
      },
    });

    expect(await po.getJoinNeuronsFundCheckbox().isPresent()).toBe(false);
  });

  it("should render split button but not join neurons' fund if neuron is controlled by Ledger device", async () => {
    setAccountsForTesting({
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

  it("should render dissolve date if neuron is dissolving", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolving,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        dissolveState: {
          WhenDissolvedTimestampSeconds: BigInt(
            nowInSeconds + SECONDS_IN_FOUR_YEARS
          ),
        },
      },
    };

    const po = renderComponent(neuron);

    expect(normalizeWhitespace(await po.dissolveDate())).toBe(
      "Jul 20, 2027 8:53 AM"
    );
  });

  it("should not render dissolve date if neuron is not dissolving", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Locked,
    };

    const po = renderComponent(neuron);

    expect(await po.dissolveDate()).toBeNull();
  });

  it("should display NnsNeuronPublicVisibilityAction", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getNnsNeuronPublicVisibilityActionPo().isPresent()).toBe(
      true
    );
  });

  it("should pass the correct neuron to NnsNeuronPublicVisibilityAction", async () => {
    const po = renderComponent(createMockNeuron(123));

    expect(await po.getNnsNeuronPublicVisibilityActionPo().isPresent()).toBe(
      true
    );

    expect(await po.getNeuronId()).toBe("123");
  });
});
