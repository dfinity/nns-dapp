import FollowNnsNeuronsByTopicStepNeuron from "$lib/modals/neurons/FollowNnsNeuronsByTopicStepNeuron.svelte";
import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockKnownNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { FollowNnsNeuronsByTopicStepNeuronPo } from "$tests/page-objects/FollowNnsNeuronsByTopicStepNeuron.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Topic, type NeuronInfo } from "@dfinity/nns";

describe("FollowNnsNeuronsByTopicStepNeuron", () => {
  const testNeuron: NeuronInfo = {
    ...mockNeuron,
    neuronId: 123456789n,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      // Make user the controller
      controller: mockIdentity.getPrincipal().toText(),
      hotKeys: ["test-hotkey"],
    },
  };
  const anotherKnownNeuron = {
    ...mockKnownNeuron,
    id: 987654321n,
    name: "Another Known Neuron",
  };

  const testTopics = [Topic.Governance, Topic.SnsAndCommunityFund];

  const renderComponent = (props: {
    neuron?: NeuronInfo;
    topics?: Topic[];
    errorMessage?: string;
    openPrevStep?: () => void;
    updateFollowings?: (address: string) => Promise<void>;
    clearError?: () => void;
  }) => {
    const defaultProps = {
      neuron: testNeuron,
      topics: testTopics,
      openPrevStep: vi.fn(),
      updateFollowings: vi.fn(),
      clearError: vi.fn(),
      ...props,
    };

    const { container } = render(FollowNnsNeuronsByTopicStepNeuron, {
      props: defaultProps,
    });

    return {
      po: FollowNnsNeuronsByTopicStepNeuronPo.under(
        new JestPageObjectElement(container)
      ),
      props: defaultProps,
    };
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should render the component with input field", async () => {
    const { po } = renderComponent({});

    expect(await po.getNeuronAddressInputPo().isPresent()).toBe(true);
    expect(await po.getFollowNeuronButtonPo().isPresent()).toBe(true);
    expect(await po.getBackButtonPo().isPresent()).toBe(true);
  });

  it("should bind neuron address field", async () => {
    const { po } = renderComponent({});

    // Initially empty
    expect(await po.getNeuronAddressValue()).toBe("");

    // Type in address
    await po.typeNeuronAddress("1234567");
    expect(await po.getNeuronAddressValue()).toBe("1234567");
  });

  it("should disable follow button when address is empty", async () => {
    const { po } = renderComponent({});

    expect(await po.getNeuronAddressInputPo().isPresent()).toBe(true);
    expect(await po.getNeuronAddressValue()).toBe("");
    expect(await po.isFollowNeuronButtonDisabled()).toBe(true);

    await po.typeNeuronAddress("123456789");
    expect(await po.getNeuronAddressValue()).toBe("123456789");
    expect(await po.isFollowNeuronButtonDisabled()).toBe(false);

    await po.typeNeuronAddress("");
    expect(await po.isFollowNeuronButtonDisabled()).toBe(true);
  });

  it("should disable follow button when there is an error", async () => {
    const { po } = renderComponent({
      errorMessage: "Test error message",
    });

    await po.typeNeuronAddress("0123456789");
    expect(await po.isFollowNeuronButtonDisabled()).toBe(true);
  });

  it("should call updateFollowings when form is submitted", async () => {
    const { po, props } = renderComponent({});

    await po.typeNeuronAddress("0123456789");
    await po.clickFollowNeuronButton();

    expect(props.updateFollowings).toHaveBeenCalledTimes(1);
    expect(props.updateFollowings).toHaveBeenCalledWith("0123456789");
  });

  it("should call openPrevStep when back button is clicked", async () => {
    const { po, props } = renderComponent({});

    await po.clickBackButton();

    expect(props.openPrevStep).toHaveBeenCalledTimes(1);
  });

  it("should call clearError when input changes", async () => {
    const { po, props } = renderComponent({
      errorMessage: "Test error",
    });

    await po.typeNeuronAddress("1");

    expect(props.clearError).toHaveBeenCalledTimes(1);
  });

  it("should display custom error message", async () => {
    const errorMessage = "Custom error message";
    const { po } = renderComponent({
      errorMessage,
    });

    expect(await po.hasErrorMessage()).toBe(true);
    expect(await po.getErrorMessage()).toBe(errorMessage);
  });

  it("should not display custom error message when no error", async () => {
    const { po } = renderComponent({});

    expect(await po.hasErrorMessage()).toBe(false);
  });

  it("should display known neurons when available", async () => {
    knownNeuronsStore.reset();
    knownNeuronsStore.setNeurons([mockKnownNeuron, anotherKnownNeuron]);

    const { po } = renderComponent({});
    await runResolvedPromises();

    const knownNeuronItems = await po.getKnownNeuronItems();

    const names = [];
    await Promise.all(
      knownNeuronItems.map(async (item) => {
        const name = await item.getNeuronName();
        names.push(name);
      })
    );

    expect(knownNeuronItems.length).toBe(2);
    expect(names).toEqual([mockKnownNeuron.name, anotherKnownNeuron.name]);
  });

  it("should disable follow button for known neurons that are already being followed", async () => {
    // Set up a neuron that is already following the known neuron for the selected topics
    const neuronWithFollowees: NeuronInfo = {
      ...testNeuron,
      fullNeuron: {
        ...testNeuron.fullNeuron,
        followees: [
          {
            topic: Topic.Governance,
            followees: [mockKnownNeuron.id, 123n],
          },
          {
            topic: Topic.SnsAndCommunityFund,
            followees: [mockKnownNeuron.id],
          },
        ],
      },
    };

    knownNeuronsStore.setNeurons([mockKnownNeuron, anotherKnownNeuron]);

    const { po } = renderComponent({
      neuron: neuronWithFollowees,
      topics: [Topic.Governance, Topic.SnsAndCommunityFund],
    });
    await runResolvedPromises();

    const knownNeuronItems = await po.getKnownNeuronItems();
    expect(knownNeuronItems.length).toBe(2);

    const firstKnownNeuron = knownNeuronItems[0];
    expect(await firstKnownNeuron.getNeuronName()).toBe(mockKnownNeuron.name);
    expect(await firstKnownNeuron.isFollowButtonDisabled()).toBe(false);

    // Check the second known neuron (already followed)
    const secondKnownNeuron = knownNeuronItems[1];
    expect(await secondKnownNeuron.getNeuronName()).toBe(
      "Already Followed Neuron"
    );
    expect(await secondKnownNeuron.isFollowButtonDisabled()).toBe(true);
    expect(await secondKnownNeuron.hasTooltip()).toBe(true);
  });
});
