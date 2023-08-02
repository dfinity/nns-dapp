/**
 * @jest-environment jsdom
 */

import NnsNeuronPageHeader from "$lib/components/neuron-detail/NnsNeuronPageHeader.svelte";
import { dispatchIntersecting } from "$lib/directives/intersection.directives";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPageHeaderPo } from "$tests/page-objects/NnsNeuronPageHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("NnsNeuronPageHeader", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsNeuronPageHeader, { props: { neuron } });

    return NnsNeuronPageHeaderPo.under(new JestPageObjectElement(container));
  };

  it("should render the NNS universe name", async () => {
    const po = renderComponent(mockNeuron);

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
      props: { neuron: mockNeuron },
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
});
