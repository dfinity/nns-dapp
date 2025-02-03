import NnsNeuronPageHeader from "$lib/components/neuron-detail/NnsNeuronPageHeader.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { dispatchIntersecting } from "$lib/utils/events.utils";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPageHeaderPo } from "$tests/page-objects/NnsNeuronPageHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("NnsNeuronPageHeader", () => {
  const createTestNeuron = ({
    id,
    stake,
    dissolveDelaySeconds,
  }: {
    id: bigint;
    stake: bigint;
    dissolveDelaySeconds: bigint;
  }): NeuronInfo => {
    return {
      ...mockNeuron,
      neuronId: id,
      dissolveDelaySeconds,
      fullNeuron: {
        ...mockFullNeuron,
        id,
        cachedNeuronStake: stake,
      },
    };
  };

  const testNeurons: NeuronInfo[] = [
    createTestNeuron({
      id: 1n,
      stake: 400_000_000n,
      dissolveDelaySeconds: 3000n,
    }),
    createTestNeuron({
      id: 2n,
      stake: 200_000_000n,
      dissolveDelaySeconds: 2000n,
    }),
    createTestNeuron({
      id: 3n,
      stake: 300_000_000n,
      dissolveDelaySeconds: 6000n,
    }),
    createTestNeuron({
      id: 4n,
      stake: 100_000_000n,
      dissolveDelaySeconds: 4000n,
    }),
  ];

  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsNeuronPageHeader, { props: { neuron } });

    return NnsNeuronPageHeaderPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    neuronsStore.setNeurons({ neurons: testNeurons, certified: true });
  });

  it("should render the NNS universe name", async () => {
    const po = renderComponent(testNeurons[0]);

    expect(await po.getUniverse()).toEqual("Internet Computer");
  });

  const testTitle = async ({
    intersecting,
    text,
  }: {
    intersecting: boolean;
    text: string;
  }) => {
    const { getByTestId } = render(NnsNeuronPageHeader, {
      props: { neuron: testNeurons[0] },
    });

    const element = getByTestId("neuron-id-element") as HTMLElement;

    dispatchIntersecting({ element, intersecting });

    const title = get(layoutTitleStore);
    expect(title).toEqual({ title: "Neuron", header: text });
  };

  it("should render a title with neuron ID if title is not intersecting viewport", () =>
    testTitle({ intersecting: false, text: "ICP – 1" }));

  it("should render a static title if title is intersecting viewport", () =>
    testTitle({ intersecting: true, text: "Neuron" }));

  it("should hide previous link for first neuron", async () => {
    const po = renderComponent(testNeurons[0]);

    expect(await po.getNeuronNavigationPo().isPreviousLinkHidden()).toBe(true);
  });

  it("should hide next link for last neuron", async () => {
    const po = renderComponent(testNeurons[3]);

    expect(await po.getNeuronNavigationPo().isNextLinkHidden()).toBe(true);
  });

  it("should not display navigation if there is only 1 neuron", async () => {
    neuronsTableOrderStore.set([]);
    neuronsStore.setNeurons({ neurons: [testNeurons[0]], certified: true });
    const po = renderComponent(testNeurons[0]);

    expect(await po.getNeuronNavigationPo().isPresent()).toBe(false);
  });

  it("should have the correct hrefs for previous and next neuron", async () => {
    neuronsTableOrderStore.set([]);
    const po = renderComponent(testNeurons[1]);

    expect(await po.getNeuronNavigationPo().getPreviousLinkPo().getHref()).toBe(
      "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=1"
    );
    expect(await po.getNeuronNavigationPo().getNextLinkPo().getHref()).toBe(
      "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=3"
    );
  });

  it("should display correct order in navigation when table order based on dissolveDelay", async () => {
    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
      },
    ]);
    const po = renderComponent(testNeurons[0]);

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("4");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("2");
  });

  it("should display correct order in navigation when table order is reversed", async () => {
    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
      },
    ]);
    const po = renderComponent(testNeurons[0]);

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("4");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("2");

    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
        reversed: true,
      },
    ]);

    await runResolvedPromises();

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("2");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("4");
  });

  it("should display correct order in navigation when table order based on multiple orders, dissolveDelay reversed and stake", async () => {
    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
        reversed: true,
      },
      {
        columnId: "stake",
      },
    ]);

    const po = renderComponent(testNeurons[0]);

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("2");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("4");
  });

  it("should update navigation order when new neurons are added", async () => {
    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
        reversed: true,
      },
      {
        columnId: "stake",
      },
    ]);

    const newNeuron = createTestNeuron({
      id: 5n,
      stake: 100_000_000n,
      dissolveDelaySeconds: 2000n,
    });

    const po = renderComponent(testNeurons[0]);

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("2");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("4");

    neuronsStore.pushNeurons({
      neurons: [...testNeurons, newNeuron],
      certified: true,
    });

    await runResolvedPromises();

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("5");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("4");
  });
});
