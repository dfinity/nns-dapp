import * as governanceApi from "$lib/api/governance.api";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronRewardStatusActionPo } from "$tests/page-objects/NnsNeuronRewardStatusAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NnsNeuronRewardStatusActionTest from "./NnsNeuronRewardStatusActionTest.svelte";

describe("NnsNeuronRewardStatusAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsNeuronRewardStatusActionTest, {
      props: {
        neuron,
      },
    });

    return NnsNeuronRewardStatusActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime("2024-01-01");
  });

  it("should render active neuron state", async () => {
    const testNeuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        votingPowerRefreshedTimestampSeconds: BigInt(nowInSeconds()),
      },
    };
    const po = renderComponent(testNeuron);

    expect(await po.getTitle()).toBe("Active neuron");
    expect(await po.getDescription()).toBe(
      "182 days, 15 hours to confirm following"
    );
    expect(await po.getConfirmFollowingButtonPo().isPresent()).toBe(true);
    expect(await po.getFollowNeuronsButtonPo().isPresent()).toBe(false);
  });

  it("should render losing soon neuron state", async () => {
    const tenDays = 10;
    const testNeuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        votingPowerRefreshedTimestampSeconds: BigInt(
          nowInSeconds() - SECONDS_IN_HALF_YEAR + tenDays * SECONDS_IN_DAY
        ),
      },
    };
    const po = renderComponent(testNeuron);

    expect(await po.getTitle()).toBe("Missing rewards soon");
    expect(await po.getDescription()).toBe(
      `${tenDays} days to confirm following`
    );
    expect(await po.getConfirmFollowingButtonPo().isPresent()).toBe(true);
    expect(await po.getFollowNeuronsButtonPo().isPresent()).toBe(false);
  });

  it("should render inactive neuron reward state", async () => {
    const testNeuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        votingPowerRefreshedTimestampSeconds: BigInt(
          nowInSeconds() - SECONDS_IN_HALF_YEAR
        ),
      },
    };
    const po = renderComponent(testNeuron);

    expect(await po.getTitle()).toBe("Inactive neuron");
    expect(await po.getDescription()).toBe(
      "Confirm following or vote manually to continue receiving rewards"
    );
    expect(await po.getConfirmFollowingButtonPo().isPresent()).toBe(true);
    expect(await po.getFollowNeuronsButtonPo().isPresent()).toBe(false);
  });

  it("should render inactive/reset following neuron reward state", async () => {
    const testNeuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        votingPowerRefreshedTimestampSeconds: BigInt(
          nowInSeconds() - SECONDS_IN_HALF_YEAR - SECONDS_IN_MONTH
        ),
        controller: mockIdentity.getPrincipal().toText(),
      },
    };
    const po = renderComponent(testNeuron);

    expect(await po.getTitle()).toBe("Inactive neuron");
    expect(await po.getDescription()).toBe(
      "Following has been reset. Confirm following or vote manually to continue receiving rewards"
    );
    expect(await po.getConfirmFollowingButtonPo().isPresent()).toBe(false);
    expect(await po.getFollowNeuronsButtonPo().isPresent()).toBe(true);
    expect(await po.getFollowNeuronsButtonPo().isButtonStyleSecondary()).toBe(
      true
    );
  });

  it("should refresh voting power", async () => {
    const testNeuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        votingPowerRefreshedTimestampSeconds: BigInt(
          nowInSeconds() - SECONDS_IN_HALF_YEAR + 10 * SECONDS_IN_DAY
        ),
        controller: mockIdentity.getPrincipal().toText(),
      },
    };
    resetIdentity();
    neuronsStore.setNeurons({
      neurons: [testNeuron],
      certified: true,
    });
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([testNeuron]);
    const spyRefreshVotingPower = vi
      .spyOn(governanceApi, "refreshVotingPower")
      .mockResolvedValue();
    vi.spyOn(governanceApi, "queryKnownNeurons").mockResolvedValue([]);

    const po = renderComponent(testNeuron);

    expect(spyRefreshVotingPower).toHaveBeenCalledTimes(0);

    expect(await po.getConfirmFollowingButtonPo().isPresent()).toBe(true);
    await po.getConfirmFollowingButtonPo().click();
    await runResolvedPromises();

    expect(spyRefreshVotingPower).toHaveBeenCalledTimes(1);
    expect(spyRefreshVotingPower).toHaveBeenCalledWith({
      identity: mockIdentity,
      neuronId: testNeuron.neuronId,
    });
  });
});
