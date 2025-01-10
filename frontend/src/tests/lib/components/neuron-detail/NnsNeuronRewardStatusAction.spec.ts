import {
  SECONDS_IN_DAY,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import { nowInSeconds } from "$lib/utils/date.utils";
import NnsNeuronRewardStatusActionTest from "$tests/lib/components/neuron-detail/NnsNeuronRewardStatusActionTest.svelte";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronRewardStatusActionPo } from "$tests/page-objects/NnsNeuronRewardStatusAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

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
    expect(await po.getFollowNeuronsButtonPo().isButtonVariantSecondary()).toBe(
      true
    );
  });
});
