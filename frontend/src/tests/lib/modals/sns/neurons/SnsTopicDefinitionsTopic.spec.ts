import SnsTopicDefinitionsTopic from "$lib/modals/sns/neurons/SnsTopicDefinitionsTopic.svelte";
import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
import { SnsTopicDefinitionsTopicPo } from "$tests/page-objects/SnsTopicDefinitionsTopic.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import type { SnsNervousSystemFunction } from "@dfinity/sns";

describe("SnsTopicDefinitionsTopic", () => {
  const nativeNsFunction1: SnsNervousSystemFunction = {
    id: 1n,
    name: "Native Function 1",
    description: ["Native Function 1 Description"],
    function_type: [],
  };
  const nativeNsFunction2: SnsNervousSystemFunction = {
    id: 2n,
    name: "Native Function 2",
    description: ["Native Function 2 Description"],
    function_type: [],
  };
  const genericNsFunction: SnsNervousSystemFunction = {
    id: 1001n,
    name: "Custom Function",
    description: ["Custom Function Description"],
    function_type: [],
  };
  const topicKey = "DaoCommunitySettings";
  const topicName = "Topic name";
  const topicDescription = "Topic description";
  const topicInfo: TopicInfoWithUnknown = {
    native_functions: [[nativeNsFunction1, nativeNsFunction2]],
    topic: [
      {
        [topicKey]: null,
      },
    ],
    is_critical: [true],
    name: [topicName],
    description: [topicDescription],
    custom_functions: [[genericNsFunction]],
    extension_operations: [],
  };

  const renderComponent = (props: { topicInfo: TopicInfoWithUnknown }) => {
    const { container } = render(SnsTopicDefinitionsTopic, { props });
    return SnsTopicDefinitionsTopicPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("displays topic info", async () => {
    const po = renderComponent({ topicInfo });

    expect(await po.getTopicName()).toEqual(topicName);
    expect(await po.getTopicDescription()).toEqual(topicDescription);
  });

  it("displays topic functions", async () => {
    const po = renderComponent({ topicInfo });

    const nsFunctionNames = await po.getNsFunctionNames();
    expect(nsFunctionNames).toEqual([
      nativeNsFunction1.name,
      nativeNsFunction2.name,
      genericNsFunction.name,
    ]);

    const nsFunctionTooltipTexts = await po.getNsFunctionTooltipTexts();
    expect(nsFunctionTooltipTexts).toEqual([
      nativeNsFunction1.description[0],
      nativeNsFunction2.description[0],
      genericNsFunction.description[0],
    ]);
  });
});
