import FollowSnsNeuronsByTopicItem from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicItem.svelte";
import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
import { FollowSnsNeuronsByTopicItemPo } from "$tests/page-objects/FollowSnsNeuronsByTopicItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import type { SnsNervousSystemFunction } from "@dfinity/sns";

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

  const renderComponent = (props: {
    topicInfo: TopicInfoWithUnknown;
    checked: boolean;
    onNnsChange?: () => void;
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
    checked: false,
    onNnsChange: vi.fn(),
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
});
