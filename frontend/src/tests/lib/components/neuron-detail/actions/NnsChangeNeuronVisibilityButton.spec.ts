import NnsChangeNeuronVisibilityButton from "$lib/components/neuron-detail/actions/NnsChangeNeuronVisibilityButton.svelte";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { ChangeNeuronVisibilityModalPo } from "$tests/page-objects/ChangeNeuronVisibilityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronVisibility } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsChangeNeuronVisibilityButton", () => {
  const renderComponentAndModal = ({
    visibility = undefined,
    disabled = undefined,
  }: {
    visibility?: NeuronVisibility;
    disabled?: boolean;
  }) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron: { ...mockNeuron, visibility },
        moreProps: {
          disabled,
        },
        testComponent: NnsChangeNeuronVisibilityButton,
      },
    });
    const element = new JestPageObjectElement(container);
    return {
      po: ButtonPo.under({
        element,
        testId: "change-neuron-visibility-button",
      }),
      modalPo: ChangeNeuronVisibilityModalPo.under(element),
    };
  };

  it("should display 'Make Neuron Private' for public neurons", async () => {
    const { po } = renderComponentAndModal({
      visibility: NeuronVisibility.Public,
    });

    expect(await po.getText()).toBe("Make Neuron Private");
  });

  it("should display 'Make Neuron Public' for private neurons", async () => {
    const { po } = renderComponentAndModal({
      visibility: NeuronVisibility.Private,
    });

    expect(await po.getText()).toBe("Make Neuron Public");
  });

  it("opens change neuron visibility modal", async () => {
    const { po, modalPo } = renderComponentAndModal({});

    expect(await po.isPresent()).toBe(true);

    await po.click();

    expect(await modalPo.isPresent()).toBe(true);
  });

  it("should display disabled button if disabled", async () => {
    const { po, modalPo } = renderComponentAndModal({ disabled: true });

    expect(await po.isDisabled()).toBe(true);

    await po.click();

    expect(await modalPo.isPresent()).toBe(false);
  });
});
