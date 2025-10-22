import FollowNnsNeuronsByTopicItem from "$lib/modals/neurons/FollowNnsNeuronsByTopicItem.svelte";
import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { mockKnownNeuron } from "$tests/mocks/neurons.mock";
import { FollowNnsNeuronsByTopicItemPo } from "$tests/page-objects/FollowNnsNeuronsByTopicItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Topic, type FolloweesForTopic, type NeuronId } from "@dfinity/nns";

describe("FollowNnsNeuronsByTopicItem", () => {
  const testTopic = Topic.ExchangeRate;
  const neuronId1: NeuronId = 123456789n;
  const neuronId2: NeuronId = 987654321n;

  const renderComponent = (props: {
    topic: Topic;
    followees: FolloweesForTopic[];
    checked: boolean;
    onNnsChange: () => void;
    removeFollowing: () => void;
  }) => {
    const { container } = render(FollowNnsNeuronsByTopicItem, {
      props,
    });

    return FollowNnsNeuronsByTopicItemPo.under(
      new JestPageObjectElement(container)
    );
  };

  const mockFollowees: FolloweesForTopic[] = [
    {
      topic: testTopic,
      followees: [neuronId1, neuronId2],
    },
  ];

  it("should render topic name", async () => {
    const po = renderComponent({
      topic: testTopic,
      followees: mockFollowees,
      checked: false,
      onNnsChange: vi.fn(),
      removeFollowing: vi.fn(),
    });

    expect(await po.getTopicName()).toContain("Exchange Rate");
  });

  it("should render topic description", async () => {
    const po = renderComponent({
      topic: testTopic,
      followees: mockFollowees,
      checked: false,
      onNnsChange: vi.fn(),
      removeFollowing: vi.fn(),
    });

    // First expand the collapsible to see the description
    await po.clickExpandButton();
    expect(await po.getTopicDescription()).toBeTruthy();
  });

  it("should show following status icon when there are followees", async () => {
    const po = renderComponent({
      topic: testTopic,
      followees: mockFollowees,
      checked: false,
      onNnsChange: vi.fn(),
      removeFollowing: vi.fn(),
    });

    expect(await po.hasFollowingStatusIcon()).toBe(true);
  });

  it("should not show following status icon when there are no followees", async () => {
    const po = renderComponent({
      topic: testTopic,
      followees: [],
      checked: false,
      onNnsChange: vi.fn(),
      removeFollowing: vi.fn(),
    });

    expect(await po.hasFollowingStatusIcon()).toBe(false);
  });

  it("should render followee neurons", async () => {
    const po = renderComponent({
      topic: testTopic,
      followees: mockFollowees,
      checked: false,
      onNnsChange: vi.fn(),
      removeFollowing: vi.fn(),
    });

    // First expand the collapsible to see the followees
    await po.clickExpandButton();
    const neuronIds = await po.getFolloweesNeuronIds();
    expect(neuronIds).toHaveLength(2);
    expect(neuronIds).toContain(neuronId1.toString());
    expect(neuronIds).toContain(neuronId2.toString());
  });

  it("should call onNnsChange when checkbox is clicked", async () => {
    const mockOnNnsChange = vi.fn();
    const po = renderComponent({
      topic: testTopic,
      followees: mockFollowees,
      checked: false,
      onNnsChange: mockOnNnsChange,
      removeFollowing: vi.fn(),
    });

    await po.getCheckboxPo().click();
    expect(mockOnNnsChange).toHaveBeenCalledWith({
      topic: testTopic,
      checked: true,
    });
  });

  it("should call removeFollowing when remove button is clicked", async () => {
    const mockRemoveFollowing = vi.fn();
    const po = renderComponent({
      topic: testTopic,
      followees: mockFollowees,
      checked: false,
      onNnsChange: vi.fn(),
      removeFollowing: mockRemoveFollowing,
    });

    // First expand the collapsible to see the followees
    await po.clickExpandButton();
    const followeePos = await po.getFolloweesPo();

    // Click the remove button on the first followee
    await followeePos[0].clickRemoveButton();

    expect(mockRemoveFollowing).toHaveBeenCalledWith({
      topic: testTopic,
      followee: neuronId1,
    });
  });

  it("should expand and collapse content", async () => {
    const po = renderComponent({
      topic: testTopic,
      followees: mockFollowees,
      checked: false,
      onNnsChange: vi.fn(),
      removeFollowing: vi.fn(),
    });

    const collapsible = po.getCollapsiblePo();

    expect(await collapsible.isExpanded()).toBe(false);

    await po.clickExpandButton();
    expect(await collapsible.isExpanded()).toBe(true);

    await po.clickExpandButton();
    expect(await collapsible.isExpanded()).toBe(false);
  });

  it("should display known neuron name instead of neuron ID", async () => {
    const knownNeuronId = 555666777n;
    const knownNeuronName = "Test Known Neuron";
    const testKnownNeuron = {
      ...mockKnownNeuron,
      id: knownNeuronId,
      name: knownNeuronName,
    };
    const followeesWithKnownNeuron: FolloweesForTopic[] = [
      {
        topic: testTopic,
        followees: [knownNeuronId, neuronId2],
      },
    ];

    knownNeuronsStore.setNeurons([testKnownNeuron]);

    const po = renderComponent({
      topic: testTopic,
      followees: followeesWithKnownNeuron,
      checked: false,
      onNnsChange: vi.fn(),
      removeFollowing: vi.fn(),
    });

    // Expand the collapsible to see the followees
    await po.clickExpandButton();
    await runResolvedPromises();

    const neuronIds = await po.getFolloweesNeuronIds();
    expect(neuronIds).toHaveLength(2);
    expect(neuronIds).toEqual([knownNeuronName, neuronId2.toString()]);
  });
});
