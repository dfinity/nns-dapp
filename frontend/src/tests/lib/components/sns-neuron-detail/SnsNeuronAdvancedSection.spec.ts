import SnsNeuronAdvancedSection from "$lib/components/sns-neuron-detail/SnsNeuronAdvancedSection.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from "$lib/constants/constants";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronAdvancedSectionPo } from "$tests/page-objects/SnsNeuronAdvancedSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronAdvancedSection", () => {
  const nowInSeconds = 1689843195;
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronAdvancedSection, {
      props: {
        neuron,
        governanceCanisterId: mockPrincipal,
      },
    });

    return SnsNeuronAdvancedSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(nowInSeconds * 1000);
  });

  it("should render neuron data", async () => {
    const id = [
      154, 174, 251, 49, 236, 17, 214, 189, 195, 140, 58, 89, 61, 29, 138, 113,
      79, 48, 136, 37, 96, 61, 215, 50, 182, 65, 198, 97, 8, 19, 238, 36,
    ];
    const created = BigInt(nowInSeconds - SECONDS_IN_MONTH);
    const neuron = createMockSnsNeuron({
      id,
      createdTimestampSeconds: created,
      ageSinceSeconds: created + BigInt(SECONDS_IN_DAY * 10),
    });
    const po = renderComponent(neuron);

    expect(await po.neuronId()).toBe("9aaefb3...813ee24");
    expect(normalizeWhitespace(await po.neuronCreated())).toBe(
      "Jun 19, 2023 10:23 PM"
    );
    expect(await po.neuronAge()).toBe("20 days, 10 hours");
    expect(await po.neuronAccount()).toBe("xlmdg-v...813ee24");
  });
});
