import SnsNeuronPageHeader from "$lib/components/sns-neuron-detail/SnsNeuronPageHeader.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { dispatchIntersecting } from "$lib/utils/events.utils";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import en from "$tests/mocks/i18n.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronPageHeaderPo } from "$tests/page-objects/SnsNeuronPageHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle, type SnsNeuron } from "@dfinity/sns";
import { get } from "svelte/store";

describe("SnsNeuronPageHeader", () => {
  const rootCanisterId = mockPrincipal;
  const testSnsNeurons: SnsNeuron[] = [
    createMockSnsNeuron({
      id: [1],
      stake: 400_000_000n,
      dissolveDelaySeconds: 3000n,
    }),
    createMockSnsNeuron({
      id: [2],
      stake: 200_000_000n,
      dissolveDelaySeconds: 2000n,
    }),
    createMockSnsNeuron({
      id: [3],
      stake: 300_000_000n,
      dissolveDelaySeconds: 6000n,
    }),
    createMockSnsNeuron({
      id: [4],
      stake: 100_000_000n,
      dissolveDelaySeconds: 4000n,
    }),
  ];

  const projectName = "Tetris";

  const renderSnsNeuronCmp = (neuron: SnsNeuron) => {
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronPageHeader,
      neuron,
      reload: vi.fn(),
      props: {
        token: mockToken,
      },
    });

    return SnsNeuronPageHeaderPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        projectName,
      },
    ]);
    snsNeuronsStore.setNeurons({
      rootCanisterId,
      neurons: testSnsNeurons,
      certified: true,
    });
    page.mock({ data: { universe: rootCanisterId.toText() } });
  });

  it("should render the Sns universe name", async () => {
    const po = renderSnsNeuronCmp(testSnsNeurons[0]);

    expect(await po.getUniverse()).toEqual(projectName);
  });

  const testTitle = async ({
    intersecting,
    text,
  }: {
    intersecting: boolean;
    text: string;
  }) => {
    const { getByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronPageHeader,
      neuron: testSnsNeurons[0],
      reload: vi.fn(),
      props: {
        token: mockToken,
      },
    });

    const element = getByTestId("neuron-id-element") as HTMLElement;

    dispatchIntersecting({ element, intersecting });

    const title = get(layoutTitleStore);
    expect(title).toEqual({ title: en.neuron_detail.title, header: text });
  };

  it("should render a title with neuron ID if title is not intersecting viewport", () =>
    testTitle({ intersecting: false, text: "TET - 01" }));

  it("should render a static title if title is intersecting viewport", () =>
    testTitle({ intersecting: true, text: "Neuron" }));

  it("should hide previous link for first neuron", async () => {
    const po = renderSnsNeuronCmp(testSnsNeurons[0]);

    expect(await po.getNeuronNavigationPo().isPreviousLinkHidden()).toBe(true);
  });

  it("should hide next link for last neuron", async () => {
    const po = renderSnsNeuronCmp(testSnsNeurons[3]);

    expect(await po.getNeuronNavigationPo().isNextLinkHidden()).toBe(true);
  });

  it("should not display navigation if there is only 1 neuron", async () => {
    neuronsTableOrderStore.set([]);
    snsNeuronsStore.setNeurons({
      rootCanisterId,
      neurons: [testSnsNeurons[0]],
      certified: true,
    });
    const po = renderSnsNeuronCmp(testSnsNeurons[0]);

    expect(await po.getNeuronNavigationPo().isPresent()).toBe(false);
  });

  it("should have the correct hrefs for previous and next neuron", async () => {
    neuronsTableOrderStore.set([]);
    const po = renderSnsNeuronCmp(testSnsNeurons[1]);

    expect(await po.getNeuronNavigationPo().getPreviousLinkPo().getHref()).toBe(
      "/neuron/?u=xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe&neuron=01"
    );
    expect(await po.getNeuronNavigationPo().getNextLinkPo().getHref()).toBe(
      "/neuron/?u=xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe&neuron=03"
    );
  });

  it("should display correct order in navigation when table order based on stake", async () => {
    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
      },
    ]);
    const po = renderSnsNeuronCmp(testSnsNeurons[0]);
    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("04");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("02");
  });

  it("should display correct order in navigation when table order is reversed", async () => {
    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
      },
    ]);
    const po = renderSnsNeuronCmp(testSnsNeurons[0]);

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("04");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("02");

    neuronsTableOrderStore.set([
      {
        columnId: "dissolveDelay",
        reversed: true,
      },
    ]);

    await runResolvedPromises();

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("02");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("04");
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

    const po = renderSnsNeuronCmp(testSnsNeurons[0]);

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("02");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("04");
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

    const newNeuron = createMockSnsNeuron({
      id: [5],
      stake: 100_000_000n,
      dissolveDelaySeconds: 2000n,
    });

    const po = renderSnsNeuronCmp(testSnsNeurons[0]);

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("02");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("04");

    snsNeuronsStore.addNeurons({
      rootCanisterId,
      neurons: [newNeuron],
      certified: true,
    });

    await runResolvedPromises();

    expect(await po.getNeuronNavigationPo().getPreviousNeuronId()).toBe("05");
    expect(await po.getNeuronNavigationPo().getNextNeuronId()).toBe("04");
  });
});
