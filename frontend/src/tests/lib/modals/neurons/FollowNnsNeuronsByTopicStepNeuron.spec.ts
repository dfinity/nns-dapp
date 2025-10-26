import * as api from "$lib/api/governance.api";
import FollowNnsNeuronsByTopicStepNeuron from "$lib/modals/neurons/FollowNnsNeuronsByTopicStepNeuron.svelte";
import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockKnownNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { FollowNnsNeuronsByTopicStepNeuronPo } from "$tests/page-objects/FollowNnsNeuronsByTopicStepNeuron.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { Topic, type NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";

const expectToastError = (contained: string) =>
  expect(get(toastsStore)).toMatchObject([
    {
      level: "error",
      text: expect.stringContaining(contained),
    },
  ]);
const expectNoToastError = () => expect(get(toastsStore)).toMatchObject([]);

describe("FollowNnsNeuronsByTopicStepNeuron", () => {
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
  const anotherKnownNeuron = {
    ...mockKnownNeuron,
    id: 987654321n,
    name: "Another Known Neuron",
  };

  const testTopics = [Topic.Governance, Topic.SnsAndCommunityFund];

  const renderComponent = (props: {
    neuron?: NeuronInfo;
    topics?: Topic[];
    selectedTopics?: Topic[];
    isBusy?: boolean;
    openPrevStep?: () => void;
    openFirstStep?: () => void;
  }) => {
    const defaultProps = {
      neuron: testNeuron(),
      topics: testTopics,
      selectedTopics: testTopics,
      isBusy: false,
      openPrevStep: vi.fn(),
      openFirstStep: vi.fn(),
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
    neuronsStore.setNeurons({ neurons: [testNeuron()], certified: true });
    vi.spyOn(api, "queryKnownNeurons").mockResolvedValue([]);
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

  it("should call openPrevStep when back button is clicked", async () => {
    const { po, props } = renderComponent({});

    await po.clickBackButton();

    expect(props.openPrevStep).toHaveBeenCalledTimes(1);
  });

  it("should not display error message initially", async () => {
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
      ...testNeuron(),
      fullNeuron: {
        ...testNeuron().fullNeuron,
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
    expect(await firstKnownNeuron.isFollowButtonDisabled()).toBe(true);

    const secondKnownNeuron = knownNeuronItems[1];
    expect(await secondKnownNeuron.getNeuronName()).toBe(
      anotherKnownNeuron.name
    );
    expect(await secondKnownNeuron.isFollowButtonDisabled()).toBe(false);
    expect(await secondKnownNeuron.hasTooltip()).toBe(true);
  });

  it("should call setFollowing API", async () => {
    const neuronId = testNeuron().neuronId;
    const openPrevStepSpy = vi.fn();
    const { po } = renderComponent({
      neuron: testNeuron(),
      topics: [Topic.Governance, Topic.NodeAdmin],
      openPrevStep: openPrevStepSpy,
    });

    const spySetFollowing = vi.spyOn(api, "setFollowing").mockResolvedValue();
    const spyQueryNeuron = vi
      .spyOn(api, "queryNeuron")
      .mockResolvedValue(testNeuron());

    expect(await po.isPresent()).toBe(true);

    // Step 2: Enter neuron ID and submit
    const followeeNeuronId = 987654321n;
    await po.typeNeuronAddress(`${followeeNeuronId}`);
    expect(await po.getFollowNeuronButtonPo().isDisabled()).toBe(false);

    await po.clickFollowNeuronButton();
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

    // Verify neuron was re-queried after update
    expect(spyQueryNeuron).toHaveBeenCalledTimes(1);
    expect(spyQueryNeuron).toHaveBeenCalledWith({
      identity: mockIdentity,
      certified: true,
      neuronId,
    });

    // Verify previous step was opened
    expect(openPrevStepSpy).toHaveBeenCalledTimes(1);
  });

  it("handles none-existent neuron error", async () => {
    const openPrevStepSpy = vi.fn();
    const { po } = renderComponent({
      neuron: testNeuron(),
      topics: [Topic.Governance, Topic.SnsAndCommunityFund],
      openPrevStep: openPrevStepSpy,
    });

    const spySetFollowing = vi.spyOn(api, "setFollowing");
    spySetFollowing.mockRejectedValue(
      new Error(
        `000: The neuron with ID 123 does not exist. Make sure that you copied the neuron ID correctly.`
      )
    );

    // Enter neuron ID and submit
    await po.typeNeuronAddress("123");
    await po.clickFollowNeuronButton();
    await runResolvedPromises();

    // Verify the error message is displayed in the neuron step
    expect(await po.hasErrorMessage()).toBe(true);
    expect(await po.getErrorMessage()).toBe(
      `There is no neuron with ID 123. Please choose a neuron ID from an existing neuron.`
    );

    // Should not close the modal and should not show toast
    expect(await po.isPresent()).toBe(true);
    expectNoToastError();

    // Verify staying on the same step
    expect(openPrevStepSpy).toHaveBeenCalledTimes(0);
  });

  it("handles not allowed to follow neuron error", async () => {
    const openPrevStepSpy = vi.fn();
    const { po } = renderComponent({
      neuron: testNeuron(),
      topics: [Topic.Governance, Topic.SnsAndCommunityFund],
      openPrevStep: openPrevStepSpy,
    });

    const spySetFollowing = vi.spyOn(api, "setFollowing");
    // https://github.com/dfinity/ic/blob/13a56ce65d36b85d10ee5e3171607cc2c31cf23e/rs/nns/governance/src/governance.rs#L8411
    spySetFollowing.mockRejectedValue(
      new Error("321: Neuron 123 is a private neuron... ")
    );

    await po.typeNeuronAddress("123");
    await po.clickFollowNeuronButton();
    await runResolvedPromises();

    expect(await po.hasErrorMessage()).toBe(true);
    expect(await po.getErrorMessage()).toBe(
      `Neuron 123 is a private neuron. If you control neuron 123, you can follow it after adding your principal ${mockIdentity.getPrincipal().toText()} to its list of hotkeys or setting the neuron to public. More info here.`
    );

    // Should not close the modal and should not show toast
    expect(await po.isPresent()).toBe(true);
    expectNoToastError();

    // Verify staying on the same step
    expect(openPrevStepSpy).toHaveBeenCalledTimes(0);
  });

  it("displays unknown errors in the toast", async () => {
    const openPrevStepSpy = vi.fn();
    const { po } = renderComponent({
      neuron: testNeuron(),
      topics: [Topic.Governance, Topic.SnsAndCommunityFund],
      openPrevStep: openPrevStepSpy,
    });

    const spySetFollowing = vi.spyOn(api, "setFollowing");
    spySetFollowing.mockRejectedValue(new Error("Unknown Failure"));

    expectNoToastError();

    await po.typeNeuronAddress("123");
    await po.clickFollowNeuronButton();
    await runResolvedPromises();

    // Should not close the modal but show error in toast
    expect(await po.isPresent()).toBe(true);
    expectToastError("Unknown Failure");

    // Verify staying on the same step
    expect(openPrevStepSpy).toHaveBeenCalledTimes(0);
  });
});
