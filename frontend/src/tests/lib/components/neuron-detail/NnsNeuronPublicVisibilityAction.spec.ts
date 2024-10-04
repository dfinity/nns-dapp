import NnsNeuronPublicVisibilityAction from "$lib/components/neuron-detail/NnsNeuronPublicVisibilityAction.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPublicVisibilityActionPo } from "$tests/page-objects/NnsNeuronPublicVisibilityAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronVisibility, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronPublicVisibilityAction", () => {
  const renderComponent = async (neuron) => {
    const { container } = render(NnsNeuronPublicVisibilityAction, {
      props: { neuron },
    });

    return NnsNeuronPublicVisibilityActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  const controlledNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should render elements and text for public neuron", async () => {
    const mockNeuronPublic: NeuronInfo = {
      ...controlledNeuron,
      visibility: NeuronVisibility.Public,
    };
    const po = await renderComponent(mockNeuronPublic);

    expect(await po.getTitleText()).toBe("Public Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron exposes additional information, including its votes. Learn more."
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more.");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().getText()).toBe("Make Neuron Private");
  });

  it("should render elements and text for private neuron", async () => {
    const mockNeuronPrivate: NeuronInfo = {
      ...controlledNeuron,
      visibility: NeuronVisibility.Private,
    };
    const po = await renderComponent(mockNeuronPrivate);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more."
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more.");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().getText()).toBe("Make Neuron Public");
  });

  it("should render elements and text for unspecified neuron", async () => {
    const mockNeuronUnspecified: NeuronInfo = {
      ...controlledNeuron,
      visibility: NeuronVisibility.Unspecified,
    };
    const po = await renderComponent(mockNeuronUnspecified);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more."
    );

    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more.");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().getText()).toBe("Make Neuron Public");
  });

  it("should render elements and text for neuron with no visibility", async () => {
    const mockNeuronVisibilityUndefined: NeuronInfo = {
      ...controlledNeuron,
      visibility: undefined,
    };
    const po = await renderComponent(mockNeuronVisibilityUndefined);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more."
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more.");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().getText()).toBe("Make Neuron Public");
  });

  it("should not render button but render rest for uncontroled neurons", async () => {
    const uncontroledNeuron: NeuronInfo = {
      ...mockNeuron,
      visibility: undefined,
    };
    const po = await renderComponent(uncontroledNeuron);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more."
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more.");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().isPresent()).toBe(false);
  });
});
