import FollowSnsNeuronsByTopicItem from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicItem.svelte";
import type { SnsTopicFollowee } from "$lib/types/sns";
import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
import { FollowSnsNeuronsByTopicItemPo } from "$tests/page-objects/FollowSnsNeuronsByTopicItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import type { SnsNervousSystemFunction, SnsNeuronId } from "@dfinity/sns";

describe("FollowSnsNeuronsByTopicItem", () => {
  const nativeNsFunction: SnsNervousSystemFunction = {
    id: 1n,
    name: "Native Function",
    description: ["Description 1"],
    function_type: [{ NativeNervousSystemFunction: {} }],
  };
  const topicKey = "DaoCommunitySettings";
  const topicInfo: TopicInfoWithUnknown = {
    native_functions: [[nativeNsFunction]],
    topic: [
      {
        [topicKey]: null,
      },
    ],
    is_critical: [true],
    name: ["Known topic name"],
    description: ["Known topic description"],
    custom_functions: [[]],
  };
  const neuronId1: SnsNeuronId = { id: Uint8Array.from([1, 2, 3]) };
  const neuronId2: SnsNeuronId = { id: Uint8Array.from([4, 5, 6]) };

  const renderComponent = (props: {
    topicInfo: TopicInfoWithUnknown;
    checked: boolean;
    followees: SnsTopicFollowee[];
    onNnsChange: () => void;
    removeFollowing: () => void;
  }) => {
    const { container } = render(FollowSnsNeuronsByTopicItem, {
      props,
    });

    return FollowSnsNeuronsByTopicItemPo.under(
      new JestPageObjectElement(container)
    );
  };
  const defaultProps = {
    topicInfo,
    followees: [],
    checked: false,
    onNnsChange: vi.fn(),
    removeFollowing: vi.fn(),
  };

  it("should expand and collapse", async () => {
    const po = renderComponent({
      ...defaultProps,
    });

    expect(await po.getCollapsiblePo().isExpanded()).toBe(false);
    await po.clickExpandButton();
    expect(await po.getCollapsiblePo().isExpanded()).toBe(true);
    await po.clickExpandButton();
    expect(await po.getCollapsiblePo().isExpanded()).toBe(false);
  });

  it("should dispatch on nnsChange on check", async () => {
    const onNnsChange = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      onNnsChange,
    });

    expect(await po.getCheckboxPo().isChecked()).toBe(false);

    await po.getCheckboxPo().click();
    expect(await po.getCheckboxPo().isChecked()).toBe(true);
    expect(onNnsChange).toBeCalledTimes(1);
    expect(onNnsChange).toBeCalledWith({
      checked: true,
      topicKey,
    });

    await po.getCheckboxPo().click();
    expect(await po.getCheckboxPo().isChecked()).toBe(false);
    expect(onNnsChange).toBeCalledTimes(2);
    expect(onNnsChange).toBeCalledWith({ checked: false, topicKey });
  });

  it("displays followees", async () => {
    const po = renderComponent({
      ...defaultProps,
      followees: [
        {
          neuronId: neuronId1,
        },
        {
          neuronId: neuronId2,
        },
      ],
    });

    expect(await po.getFolloweesNeuronIds()).toEqual(["010203", "040506"]);
  });

  it("triggers onRemove", async () => {
    const removeFollowing = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      followees: [
        {
          neuronId: neuronId1,
        },
        {
          neuronId: neuronId2,
        },
      ],
      removeFollowing,
    });

    const followeePos = await po.getFolloweesPo();

    await followeePos[0].clickRemoveButton();
    expect(removeFollowing).toBeCalledTimes(1);
    expect(removeFollowing).toBeCalledWith({
      neuronId: neuronId1,
      topicKey,
    });

    await followeePos[1].clickRemoveButton();
    expect(removeFollowing).toBeCalledTimes(2);
    expect(removeFollowing).toBeCalledWith({
      neuronId: neuronId2,
      topicKey,
    });
  });
});
