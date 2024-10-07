import SnsNeuronDissolveDelayItemAction from "$lib/components/sns-neuron-detail/SnsNeuronDissolveDelayItemAction.svelte";
import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  allSnsNeuronPermissions,
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronDissolveDelayItemActionPo } from "$tests/page-objects/SnsNeuronDissolveDelayItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  type SnsNervousSystemParameters,
  type SnsNeuron,
} from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronDissolveDelayItemAction", () => {
  const nowInSeconds = 1689843195;
  const maxDissolveDelay = BigInt(SECONDS_IN_EIGHT_YEARS);
  const dissolveDelayToVote = BigInt(SECONDS_IN_HALF_YEAR);
  const snsParameters: SnsNervousSystemParameters = {
    ...snsNervousSystemParametersMock,
    neuron_minimum_dissolve_delay_to_vote_seconds: [dissolveDelayToVote],
    max_dissolve_delay_seconds: [maxDissolveDelay],
    max_dissolve_delay_bonus_percentage: [25n],
  };
  const token = {
    ...mockSnsToken,
    symbol: "ZXCV",
  };

  const renderComponent = (
    neuron: SnsNeuron,
    parameters: SnsNervousSystemParameters = snsParameters
  ) => {
    const { container } = render(SnsNeuronDissolveDelayItemAction, {
      props: {
        neuron,
        parameters,
        token,
      },
    });

    return SnsNeuronDissolveDelayItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  const controllerPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions,
  };
  const noDissolvePermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions.filter(
      (p) =>
        p !==
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE
    ),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(nowInSeconds * 1000);
    resetIdentity();
  });

  it("should render dissolve delay text and bonus if neuron is locked", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      permissions: [controllerPermissions],
      dissolveDelaySeconds: BigInt(SECONDS_IN_FOUR_YEARS),
    });
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe("Dissolve Delay: 4 years");
    expect(await po.getDissolveBonus()).toBe("Dissolve delay bonus: +13%");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should render remaining text and bonus if neuron is dissolving", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
      permissions: [controllerPermissions],
      whenDissolvedTimestampSeconds: BigInt(
        nowInSeconds + SECONDS_IN_FOUR_YEARS
      ),
    });
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe("Remaining: 4 years");
    expect(await po.getDissolveBonus()).toBe("Dissolve delay bonus: +13%");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should render no bonus text if neuron is dissolving less than minimum to vote", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
      permissions: [controllerPermissions],
      whenDissolvedTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_YEAR - 1),
    });
    const parameters: SnsNervousSystemParameters = {
      ...snsParameters,
      neuron_minimum_dissolve_delay_to_vote_seconds: [BigInt(SECONDS_IN_YEAR)],
    };
    const po = renderComponent(neuron, parameters);

    expect(await po.getDissolveBonus()).toBe("No dissolve delay bonus");
  });

  it("should render dissolve delay text with 0 and no bonus text if neuron is unlocked", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
      permissions: [controllerPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe("Dissolve Delay: 0");
    expect(await po.getDissolveBonus()).toBe("No dissolve delay bonus");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should not render increase dissolve delay button if user doesn't have dissolve permissions", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
      permissions: [noDissolvePermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.hasIncreaseDissolveDelayButton()).toBe(false);
  });

  it("should not render a tooltip without dissolve delay", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
      permissions: [noDissolvePermissions],
      dissolveDelaySeconds: 0n,
    });
    const po = renderComponent(neuron);

    expect(await po.getTooltipIconPo().isPresent()).toBe(false);
  });

  it("should render tooltip when locked", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      permissions: [noDissolvePermissions],
      dissolveDelaySeconds: BigInt(SECONDS_IN_FOUR_YEARS),
    });
    const po = renderComponent(neuron);

    expect(await po.getTooltipIconPo().getTooltipText()).toBe(
      "Dissolve delay is the minimum amount of time you have to wait for the neuron to unlock, and ZXCV to be available again. If your neuron is dissolving, your ZXCV will be available in 4 years."
    );
  });

  it("should render tooltip when dissolving", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
      permissions: [noDissolvePermissions],
      dissolveDelaySeconds: BigInt(SECONDS_IN_FOUR_YEARS),
      whenDissolvedTimestampSeconds: BigInt(
        nowInSeconds + SECONDS_IN_FOUR_YEARS
      ),
    });
    const po = renderComponent(neuron);

    expect(await po.getTooltipIconPo().getTooltipText()).toBe(
      "Dissolve delay is the minimum amount of time you have to wait for the neuron to unlock, and ZXCV to be available again. If your neuron is dissolving, your ZXCV will be available in 4 years."
    );
  });
});
