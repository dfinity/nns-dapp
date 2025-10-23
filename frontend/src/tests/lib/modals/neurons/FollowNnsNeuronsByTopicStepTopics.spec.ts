import FollowNnsNeuronsByTopicStepTopics from "$lib/modals/neurons/FollowNnsNeuronsByTopicStepTopics.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { FollowNnsNeuronsByTopicStepTopicsPo } from "$tests/page-objects/FollowNnsNeuronsByTopicStepTopics.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { Topic, type NeuronInfo } from "@dfinity/nns";

describe("FollowNnsNeuronsByTopicStepTopics", () => {
  const testNeuron: NeuronInfo = {
    ...mockNeuron,
    neuronId: 123456789n,
  };

  const renderComponent = (props: {
    neuron: NeuronInfo;
    selectedTopics?: Topic[];
    onClose?: () => void;
    openNextStep?: () => void;
  }) => {
    const { container } = render(FollowNnsNeuronsByTopicStepTopics, {
      props: {
        selectedTopics: [],
        onClose: vi.fn(),
        openNextStep: vi.fn(),
        ...props,
      },
    });

    return FollowNnsNeuronsByTopicStepTopicsPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render topic items", async () => {
    const po = renderComponent({
      neuron: testNeuron,
    });

    const topicItems = await po.getTopicItemPos();
    expect(topicItems.length).toBeGreaterThan(0);
  });

  it("should render common NNS topics", async () => {
    const po = renderComponent({
      neuron: testNeuron,
    });

    // Check that some well-known topics are present
    const governanceItem = await po.getTopicItemPoByName("Governance");
    expect(await governanceItem.getTopicName()).toContain("Governance");

    const exchangeRateItem = await po.getTopicItemPoByName("Exchange Rate");
    expect(await exchangeRateItem.getTopicName()).toContain("Exchange Rate");
  });

  it("should enable next button when topics are selected", async () => {
    const po = renderComponent({
      neuron: testNeuron,
    });

    const nextButton = po.getNextButtonPo();

    expect(await nextButton.isDisabled()).toBe(true);

    await po.clickTopicItemByName("Governance");

    expect(await nextButton.isDisabled()).toBe(false);
  });

  it("should call openNextStep when next button is clicked", async () => {
    const mockOpenNextStep = vi.fn();
    const po = renderComponent({
      neuron: testNeuron,
      openNextStep: mockOpenNextStep,
    });

    // Select a topic to enable the button
    await po.clickTopicItemByName("Governance");

    await po.clickNextButton();

    expect(mockOpenNextStep).toHaveBeenCalledTimes(1);
  });

  it("should call closeModal when cancel button is clicked", async () => {
    const mockCloseModal = vi.fn();
    const po = renderComponent({
      neuron: testNeuron,
      onClose: mockCloseModal,
    });

    await po.clickCancelButton();

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  it("should update topic selection", async () => {
    const po = renderComponent({
      neuron: testNeuron,
    });

    expect(await po.getTopicSelectionByName("Governance")).toBe(false);

    await po.clickTopicItemByName("Governance");

    expect(await po.getTopicSelectionByName("Governance")).toBe(true);

    await po.clickTopicItemByName("Governance");

    expect(await po.getTopicSelectionByName("Governance")).toBe(false);
  });

  it("should support multiple topic selection", async () => {
    const po = renderComponent({
      neuron: testNeuron,
    });

    await po.clickTopicItemByName("Governance");
    await po.clickTopicItemByName("Exchange Rate");

    expect(await po.getTopicSelectionByName("Governance")).toBe(true);
    expect(await po.getTopicSelectionByName("Exchange Rate")).toBe(true);

    expect(await po.getNextButtonPo().isDisabled()).toBe(false);
  });

  it("should display core topics first in correct order", async () => {
    const po = renderComponent({
      neuron: testNeuron,
    });

    const topicItems = await po.getTopicItemPos();
    expect(topicItems.length).toBeGreaterThanOrEqual(3);

    expect(await topicItems[0].getTopicName()).toBe("Governance");
    expect(await topicItems[1].getTopicName()).toBe("SNS & Neurons' Fund");
    expect(await topicItems[2].getTopicName()).toBe(
      "All Except Governance, and SNS & Neurons' Fund"
    );
  });
});
