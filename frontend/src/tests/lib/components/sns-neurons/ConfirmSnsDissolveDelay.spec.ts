import ConfirmSnsDissolveDelay from "$lib/components/sns-neurons/ConfirmSnsDissolveDelay.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_YEAR } from "$lib/constants/constants";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { ConfirmSnsDissolveDelayPo } from "$tests/page-objects/ConfirmSnsDissolveDelay.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { NeuronState } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("ConfirmSnsDissolveDelay", () => {
  const delayInSeconds = Math.round(12.3 * SECONDS_IN_DAY);
  const neuron = createMockSnsNeuron({
    state: NeuronState.Dissolved,
  });

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
      },
    ]);
  });

  const renderComponent = ({
    props,
    onNnsBack = null,
    onNnsConfirm = null,
  }) => {
    const { container, component } = render(ConfirmSnsDissolveDelay, props);
    if (nonNullish(onNnsBack)) {
      component.$on("nnsBack", onNnsBack);
    }
    if (nonNullish(onNnsConfirm)) {
      component.$on("nnsConfirm", onNnsConfirm);
    }
    return ConfirmSnsDissolveDelayPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("renders a delay", async () => {
    const delayInSeconds = Math.round(
      2 * SECONDS_IN_YEAR + 10 * SECONDS_IN_DAY
    );
    const delayDuration = "2 years, 10 days";

    const po = renderComponent({
      props: {
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: mockSnsToken,
      },
    });

    expect(await po.getDissolveDelay()).toBe(delayDuration);
  });

  it("renders a neuron ID", async () => {
    const neuron = createMockSnsNeuron({
      id: [1, 2, 3, 4, 10, 11, 12, 13],
    });
    const po = renderComponent({
      props: {
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: mockSnsToken,
      },
    });

    expect(await po.getNeuronId()).toBe("010203040a0b0c0d");
  });

  it("renders a neuron stake", async () => {
    const neuron = createMockSnsNeuron({
      stake: 12_300_000_000n,
    });
    const tokenSymbol = "ZZZ";
    const po = renderComponent({
      props: {
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: {
          ...mockSnsToken,
          symbol: tokenSymbol,
        },
      },
    });

    expect(await po.getNeuronStake()).toBe("123.00 ZZZ Stake");
  });

  it("renders voting power", async () => {
    // Stake of 20.00 with max dissolve delay will result in 40.00 voting power.
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        neuronMinimumDissolveDelayToVoteSeconds: BigInt(delayInSeconds / 5),
        maxDissolveDelaySeconds: BigInt(delayInSeconds),
        maxDissolveDelayBonusPercentage: 100,
        maxAgeBonusPercentage: 0,
      },
    ]);
    const neuron = createMockSnsNeuron({
      stake: 2_000_000_000n,
      stakedMaturity: 0n,
    });

    const po = renderComponent({
      props: {
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: mockSnsToken,
      },
    });

    expect(await po.getVotingPower()).toBe("40.00");
  });

  it("edit button dispatches nnsBack", async () => {
    const onNnsBack = vi.fn();
    const onNnsConfirm = vi.fn();
    const po = renderComponent({
      props: {
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: mockSnsToken,
      },
      onNnsBack,
      onNnsConfirm,
    });

    expect(onNnsBack).toBeCalledTimes(0);
    await po.getEditButtonPo().click();
    expect(onNnsBack).toBeCalledTimes(1);

    expect(onNnsConfirm).toBeCalledTimes(0);
  });

  it("confirm button dispatches nnsConfirm", async () => {
    const onNnsBack = vi.fn();
    const onNnsConfirm = vi.fn();
    const po = renderComponent({
      props: {
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: mockSnsToken,
      },
      onNnsBack,
      onNnsConfirm,
    });
    expect(onNnsConfirm).toBeCalledTimes(0);
    await po.getConfirmButtonPo().click();
    expect(onNnsConfirm).toBeCalledTimes(1);

    expect(onNnsBack).toBeCalledTimes(0);
  });
});
