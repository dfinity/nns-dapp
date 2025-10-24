import * as api from "$lib/api/governance.api";
import FollowNnsNeuronsByTopicModal from "$lib/modals/neurons/FollowNnsNeuronsByTopicModal.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { FollowNnsNeuronsByTopicModalPo } from "$tests/page-objects/FollowNnsNeuronsByTopicModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { Topic, type NeuronId, type NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";

const expectToastError = (contained: string) =>
  expect(get(toastsStore)).toMatchObject([
    {
      level: "error",
      text: expect.stringContaining(contained),
    },
  ]);
const expectNoToastError = () => expect(get(toastsStore)).toMatchObject([]);

describe("FollowNnsNeuronsByTopicModal", () => {
  const neuronId = 123456789n;
  const followeeNeuronId1 = 6666666666666666n;
  const followeeNeuronId2 = 5555555555555555n;
  const testNeuron = (): NeuronInfo => ({
    ...mockNeuron,
    neuronId,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      // Make user the controller
      controller: mockIdentity.getPrincipal().toText(),
      // Add some existing followees for testing removal
      followees: [
        {
          topic: Topic.Governance,
          followees: [followeeNeuronId1, followeeNeuronId2],
        },
        {
          topic: Topic.NodeAdmin,
          followees: [followeeNeuronId1],
        },
      ],
    },
  });

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
    resetIdentity();
    neuronsStore.setNeurons({ neurons: [testNeuron()], certified: true });
    vi.spyOn(api, "queryKnownNeurons").mockResolvedValue([]);
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

  it("should call setFollowing API", async () => {
    const po = renderComponent({
      neuronId,
    });

    const spySetFollowing = vi.spyOn(api, "setFollowing").mockResolvedValue();
    const spyQueryNeuron = vi
      .spyOn(api, "queryNeuron")
      .mockResolvedValue(testNeuron());

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();

    // Step 1: Select topics
    await topicsStep.clickTopicItemByName("Governance");
    await topicsStep.clickTopicItemByName("Node Admin");

    // Verify topics are selected
    expect(await topicsStep.getTopicSelectionByName("Governance")).toBe(true);
    expect(await topicsStep.getTopicSelectionByName("Node Admin")).toBe(true);

    // Go to neuron step
    await topicsStep.clickNextButton();

    const neuronStepPo = po.getFollowNnsNeuronsByTopicStepNeuronPo();
    expect(await neuronStepPo.isPresent()).toBe(true);

    // Step 2: Enter neuron ID and submit
    const followeeNeuronId = 987654321n;
    await neuronStepPo.typeNeuronAddress(`${followeeNeuronId}`);
    expect(await neuronStepPo.getFollowNeuronButtonPo().isDisabled()).toBe(
      false
    );

    await neuronStepPo.clickFollowNeuronButton();
    await runResolvedPromises();

    // Verify service was called with correct parameters
    expect(spySetFollowing).toHaveBeenCalledTimes(1);
    expect(spySetFollowing).toHaveBeenCalledWith({
      identity: mockIdentity,
      neuronId,
      topicFollowing: [
        {
          followees: [followeeNeuronId1, followeeNeuronId2, followeeNeuronId],
          topic: Topic.Governance,
        },
        {
          followees: [followeeNeuronId1, followeeNeuronId],
          topic: Topic.NodeAdmin,
        },
      ],
    });

    await runResolvedPromises();

    // Verify we're back on the topics step
    expect(await neuronStepPo.isPresent()).toBe(false);
    expect(await po.getFollowNnsNeuronsByTopicStepTopicsPo().isPresent()).toBe(
      true
    );

    // Verify neuron was re-queried after update
    expect(spyQueryNeuron).toHaveBeenCalledTimes(1);
    expect(spyQueryNeuron).toHaveBeenCalledWith({
      identity: mockIdentity,
      certified: true,
      neuronId,
    });

    // Verify topics selection has been cleared
    expect(await topicsStep.getTopicSelectionByName("Governance")).toBe(false);
    expect(await topicsStep.getTopicSelectionByName("Node Admin")).toBe(false);
  });

  it("handles none-existent neuron error", async () => {
    const po = renderComponent({
      neuronId,
    });

    const spySetFollowing = vi.spyOn(api, "setFollowing");
    spySetFollowing.mockRejectedValue(
      new Error(
        `000: The neuron with ID 123 does not exist. Make sure that you copied the neuron ID correctly.`
      )
    );

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();

    // Select a topic and go to neuron step
    await topicsStep.clickTopicItemByName("Governance");
    await topicsStep.clickNextButton();

    const neuronStepPo = po.getFollowNnsNeuronsByTopicStepNeuronPo();

    // Enter neuron ID and submit
    await neuronStepPo.typeNeuronAddress("123");
    await neuronStepPo.clickFollowNeuronButton();
    await runResolvedPromises();

    // Verify the error message is displayed in the neuron step
    expect(await neuronStepPo.hasErrorMessage()).toBe(true);
    expect(await neuronStepPo.getErrorMessage()).toBe(
      `There is no neuron with ID 123. Please choose a neuron ID from an existing neuron.`
    );

    // Should not close the modal and should not show toast
    expect(await neuronStepPo.isPresent()).toBe(true);
    expectNoToastError();
  });

  it("handles not allowed to follow neuron error", async () => {
    const po = renderComponent({
      neuronId,
    });

    const spySetFollowing = vi.spyOn(api, "setFollowing");
    // https://github.com/dfinity/ic/blob/13a56ce65d36b85d10ee5e3171607cc2c31cf23e/rs/nns/governance/src/governance.rs#L8411
    spySetFollowing.mockRejectedValue(
      new Error("321: Neuron 123 is a private neuron... ")
    );

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();
    await topicsStep.clickTopicItemByName("Governance");
    await topicsStep.clickNextButton();

    const neuronStepPo = po.getFollowNnsNeuronsByTopicStepNeuronPo();

    await neuronStepPo.typeNeuronAddress("123");
    await neuronStepPo.clickFollowNeuronButton();
    await runResolvedPromises();

    expect(await neuronStepPo.hasErrorMessage()).toBe(true);
    expect(await neuronStepPo.getErrorMessage()).toBe(
      `Neuron 123 is a private neuron. If you control neuron 123, you can follow it after adding your principal ${mockIdentity.getPrincipal().toText()} to its list of hotkeys or setting the neuron to public. More info here.`
    );

    // Should not close the modal and should not show toast
    expect(await neuronStepPo.isPresent()).toBe(true);
    expectNoToastError();
  });

  it("displays unknown errors in the toast", async () => {
    const po = renderComponent({
      neuronId,
    });

    const spySetFollowing = vi.spyOn(api, "setFollowing");
    spySetFollowing.mockRejectedValue(new Error("Unknown Failure"));

    const topicsStep = po.getFollowNnsNeuronsByTopicStepTopicsPo();

    await topicsStep.clickTopicItemByName("Governance");
    await topicsStep.clickNextButton();

    const neuronStepPo = po.getFollowNnsNeuronsByTopicStepNeuronPo();

    expectNoToastError();

    await neuronStepPo.typeNeuronAddress("123");
    await neuronStepPo.clickFollowNeuronButton();
    await runResolvedPromises();

    // Should not close the modal but show error in toast
    expect(await neuronStepPo.isPresent()).toBe(true);
    expectToastError("Unknown Failure");
  });
});
