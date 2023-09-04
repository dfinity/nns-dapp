/**
 * @jest-environment jsdom
 */

import SnsNeuronPageHeader from "$lib/components/sns-neuron-detail/SnsNeuronPageHeader.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { dispatchIntersecting } from "$lib/utils/events.utils";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronPageHeaderPo } from "$tests/page-objects/SnsNeuronPageHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle, type SnsNeuron } from "@dfinity/sns";
import { get } from "svelte/store";

describe("SnsNeuronPageHeader", () => {
  const renderSnsNeuronCmp = (neuron: SnsNeuron) => {
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronPageHeader,
      neuron,
      reload: jest.fn(),
      props: {
        token: mockToken,
      },
    });

    return SnsNeuronPageHeaderPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetSnsProjects();
  });

  it("should render the Sns universe name", async () => {
    const projectName = "Tetris";
    const rootCanisterId = mockPrincipal;
    setSnsProjects([
      {
        rootCanisterId: rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        projectName,
      },
    ]);
    page.mock({ data: { universe: rootCanisterId.toText() } });

    const po = renderSnsNeuronCmp(mockSnsNeuron);

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
      neuron: mockSnsNeuron,
      reload: jest.fn(),
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
    testTitle({ intersecting: false, text: "TET - 01050309090302" }));

  it("should render a static title if title is intersecting viewport", () =>
    testTitle({ intersecting: true, text: "Neuron" }));
});
