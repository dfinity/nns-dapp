import NeuronNavigation from "$lib/components/neuron-detail/NeuronNavigation.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { page } from "$mocks/$app/stores";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronNavigationPo } from "$tests/page-objects/NeuronNavigation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";
const testNeurons = [
  {
    ...mockNeuron,
    neuronId: BigInt(1),
    fullNeuron: {
      ...mockFullNeuron,
    },
  },
  {
    ...mockNeuron,
    neuronId: BigInt(2),
    fullNeuron: {
      ...mockFullNeuron,
    },
  },
  {
    ...mockNeuron,
    neuronId: BigInt(3),
    fullNeuron: {
      ...mockFullNeuron,
    },
  },
];

describe("NeuronNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    neuronsStore.reset();
    neuronsStore.setNeurons({ neurons: testNeurons, certified: true });
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  const renderComponent = async ({
    currentNeuronId = "1",
    neuronIds = ["1", "2", "3"],
  }: {
    currentNeuronId?: string;
    neuronIds?: string[];
  }) => {
    const { container } = render(NeuronNavigation, {
      props: {
        currentNeuronId,
        neuronIds,
      },
    });
    await runResolvedPromises();
    return NeuronNavigationPo.under(new JestPageObjectElement(container));
  };

  it("should render navigation component", async () => {
    const po = await renderComponent({});

    expect(await po.isPresent()).toBe(true);
  });

  it("should not render navigation component if there is only 1 neuron", async () => {
    const po = await renderComponent({ neuronIds: ["1"] });

    expect(await po.isPresent()).toBe(false);
  });

  it("should render navigation links", async () => {
    const po = await renderComponent({});

    expect(await po.isPreviousLinkHidden()).toBe(true);
    expect(await po.isNextLinkHidden()).toBe(false);
  });

  it("should disable previous link for first neuron", async () => {
    const po = await renderComponent({ currentNeuronId: "1" });

    expect(await po.isPreviousLinkHidden()).toBe(true);
    expect(await po.isNextLinkHidden()).toBe(false);
  });

  it("should disable next link for last neuron", async () => {
    const po = await renderComponent({ currentNeuronId: "3" });

    expect(await po.isPreviousLinkHidden()).toBe(false);
    expect(await po.isNextLinkHidden()).toBe(true);
  });

  it("should enable both links for middle neuron", async () => {
    const po = await renderComponent({ currentNeuronId: "2" });

    expect(await po.isPreviousLinkHidden()).toBe(false);
    expect(await po.isNextLinkHidden()).toBe(false);
  });

  it("should have correct href for previous link", async () => {
    const po = await renderComponent({
      currentNeuronId: "2",
    });

    expect(await po.getPreviousLinkPo().getHref()).toBe(
      "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=1"
    );
  });

  it("should have correct href for next link", async () => {
    const po = await renderComponent({
      currentNeuronId: "2",
    });

    expect(await po.getNextLinkPo().getHref()).toBe(
      "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=3"
    );
  });
});
