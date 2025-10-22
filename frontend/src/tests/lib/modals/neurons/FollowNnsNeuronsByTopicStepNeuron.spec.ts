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

  const testTopics = [Topic.Governance, Topic.SnsAndCommunityFund];

  const renderComponent = (props: {
    neuron?: NeuronInfo;
    topics?: Topic[];
    errorMessage?: string;
    openPrevStep?: () => void;
    addFolloweeByAddress?: (address: string) => Promise<void>;
    clearError?: () => void;
  }) => {
    const defaultProps = {
      neuron: testNeuron,
      topics: testTopics,
      openPrevStep: vi.fn(),
      addFolloweeByAddress: vi.fn(),
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
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
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

  it("should call addFolloweeByAddress when form is submitted", async () => {
    const { po, props } = renderComponent({});

    await po.typeNeuronAddress("0123456789");
    await po.clickFollowNeuronButton();

    expect(props.addFolloweeByAddress).toHaveBeenCalledTimes(1);
    expect(props.addFolloweeByAddress).toHaveBeenCalledWith("0123456789");
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

  // TODO: expand known neuron tests
  it("should display known neurons when available", async () => {
    knownNeuronsStore.setNeurons([
      mockKnownNeuron,
      { ...mockKnownNeuron, id: 987654321n, name: "Another Known Neuron" },
    ]);

    const { po } = renderComponent({});
    await runResolvedPromises();

    const knownNeuronItems = await po.getKnownNeuronItems();
    expect(knownNeuronItems.length).toBeGreaterThan(0);
  });
});
