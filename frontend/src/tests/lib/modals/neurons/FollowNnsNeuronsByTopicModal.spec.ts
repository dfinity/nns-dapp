import FollowNnsNeuronsByTopicModal from "$lib/modals/neurons/FollowNnsNeuronsByTopicModal.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { FollowNnsNeuronsByTopicModalPo } from "$tests/page-objects/FollowNnsNeuronsByTopicModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { type NeuronId, type NeuronInfo } from "@dfinity/nns";

describe("FollowNnsNeuronsByTopicModal", () => {
  const neuronId = 123456789n;
  const testNeuron: NeuronInfo = {
    ...mockNeuron,
    neuronId,
  };

  const renderComponent = (props: {
    neuronId: NeuronId;
    onClose?: () => void;
  }) => {
    const { container } = render(FollowNnsNeuronsByTopicModal, {
      props: {
        neuronId,
        onClose: vi.fn(),
        ...props,
      },
    });

    return FollowNnsNeuronsByTopicModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    neuronsStore.setNeurons({ neurons: [testNeuron], certified: true });
  });

  it("should render topics step initially", async () => {
    const po = renderComponent({
      neuronId,
    });

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();
    expect(await topicsStep.isPresent()).toBe(true);
    expect(await po.getFollowNnsNeuronsByTopicStepNeuronPo().isPresent()).toBe(
      false
    );
  });

  it("should show neuron step when next is clicked", async () => {
    const po = renderComponent({
      neuronId,
    });

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();

    // Select a topic first (required to enable Next button)
    await topicsStep.clickTopicItemByName("Governance");

    // Click next to go to the neuron step
    await topicsStep.clickNextButton();

    expect(await po.getFollowNnsNeuronsByTopicStepNeuronPo().isPresent()).toBe(
      true
    );
    expect(await topicsStep.isPresent()).toBe(false);
  });

  it("should call closeModal when cancel is clicked", async () => {
    const mockCloseModal = vi.fn();
    const po = renderComponent({
      neuronId,
      onClose: mockCloseModal,
    });

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();
    await topicsStep.clickCancelButton();

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  it("should disable next button when no topics selected", async () => {
    const po = renderComponent({
      neuronId,
    });

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();
    const nextButton = topicsStep.getNextButtonPo();

    expect(await nextButton.isDisabled()).toBe(true);
  });

  it("should enable next button when topics are selected", async () => {
    const po = renderComponent({
      neuronId,
    });

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();

    // Select a topic
    await topicsStep.clickTopicItemByName("Governance");

    const nextButton = topicsStep.getNextButtonPo();
    expect(await nextButton.isDisabled()).toBe(false);
  });

  it("should navigate back to topics step when back button is clicked", async () => {
    const po = renderComponent({
      neuronId,
    });

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();

    // Select a topic and go to neuron step
    await topicsStep.clickTopicItemByName("Governance");
    await topicsStep.clickNextButton();

    const neuronStep = po.getFollowNnsNeuronsByTopicStepNeuronPo();
    await neuronStep.clickBackButton();

    // Should be back on topics step
    expect(await topicsStep.isPresent()).toBe(true);
    expect(await po.getFollowNnsNeuronsByTopicStepNeuronPo().isPresent()).toBe(
      false
    );
  });
});
