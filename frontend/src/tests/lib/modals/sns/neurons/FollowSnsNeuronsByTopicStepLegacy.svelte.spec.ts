import FollowSnsNeuronsByTopicStepLegacy from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepLegacy.svelte";
import type { SnsTopicKey } from "$lib/types/sns";
import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
import {
  genericNervousSystemFunctionMock,
  nativeNervousSystemFunctionMock,
} from "$tests/mocks/sns-functions.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { topicInfoMock } from "$tests/mocks/sns-topics.mock";
import { FollowSnsNeuronsByTopicStepLegacyPo } from "$tests/page-objects/FollowSnsNeuronsByTopicStepLegacy.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNervousSystemFunction, SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("FollowSnsNeuronsByTopicStepLegacy", () => {
  // Native Nervous System Function
  const nativeNsFunctionId = 1n;
  const nativeNsFunction: SnsNervousSystemFunction = {
    ...nativeNervousSystemFunctionMock,
    id: 1n,
  };
  // Generic Nervous System Function
  const genericNsFunctionId = 1001n;
  const genericNsFunction: SnsNervousSystemFunction = {
    ...genericNervousSystemFunctionMock,
    id: genericNsFunctionId,
  };
  // TopicInfo
  const topicKey1: SnsTopicKey = "DaoCommunitySettings";
  const topicKey2: SnsTopicKey = "CriticalDappOperations";
  const topicName1: SnsTopicKey = "DaoCommunitySettings";
  const topicName2: SnsTopicKey = "CriticalDappOperations";
  const topicName3: SnsTopicKey = "Governance";
  const topicKeyWithoutLegacy: SnsTopicKey = "SnsFrameworkManagement";
  const testTopicInfo1: TopicInfoWithUnknown = {
    ...topicInfoMock,
    topic: [{ [topicKey1]: null }],
    name: [topicName1],
    native_functions: [[nativeNsFunction]],
    custom_functions: [[]],
  };
  const testTopicInfo2: TopicInfoWithUnknown = {
    ...topicInfoMock,
    name: [topicName2],
    topic: [{ [topicKey2]: null }],
    native_functions: [[]],
    custom_functions: [[genericNsFunction]],
  };
  const testTopicInfo3: TopicInfoWithUnknown = {
    ...topicInfoMock,
    name: [topicName3],
    topic: [{ [topicKeyWithoutLegacy]: null }],
    native_functions: [[]],
    custom_functions: [[]],
  };
  const neuronId1 = {
    id: Uint8Array.from([1, 2, 3]),
  };
  const neuronId2 = {
    id: Uint8Array.from([4, 5, 6]),
  };

  const renderComponent = (props: {
    neuron: SnsNeuron;
    topicInfos: TopicInfoWithUnknown[];
    selectedTopics: SnsTopicKey[];
    openNextStep: () => void;
    openPrevStep: () => void;
  }) => {
    const { container } = render(FollowSnsNeuronsByTopicStepLegacy, {
      props,
    });

    return FollowSnsNeuronsByTopicStepLegacyPo.under(
      new JestPageObjectElement(container)
    );
  };
  const defaultProps = {
    neuron: mockSnsNeuron,
    topicInfos: [],
    selectedTopics: [],
    openNextStep: vi.fn(),
    openPrevStep: vi.fn(),
  };

  it("displays selected topics with legacy followings ", async () => {
    const neuron: SnsNeuron = {
      ...mockSnsNeuron,
      followees: [
        [nativeNsFunctionId, { followees: [neuronId1] }],
        [genericNsFunctionId, { followees: [neuronId2] }],
      ],
    };
    const po = renderComponent({
      ...defaultProps,
      neuron,
      topicInfos: [testTopicInfo1, testTopicInfo2, testTopicInfo3],
      selectedTopics: [topicName1, topicName2, topicName3],
    });

    expect(await po.getTopicNames()).toEqual([topicKey1, topicKey2]);
  });

  it("displays legacy followings of selected topics", async () => {
    const neuron: SnsNeuron = {
      ...mockSnsNeuron,
      followees: [
        [nativeNsFunctionId, { followees: [neuronId1] }],
        [genericNsFunctionId, { followees: [neuronId2] }],
      ],
    };
    const po = renderComponent({
      ...defaultProps,
      neuron,
      topicInfos: [testTopicInfo1, testTopicInfo2, testTopicInfo3],
      selectedTopics: [topicName1, topicName2],
    });

    const followeePos = await po.getFollowSnsNeuronsByTopicLegacyFolloweePos();
    expect(followeePos.length).toBe(2);

    // followee 1
    expect(await followeePos[0].getNsFunctionName()).toBe(
      nativeNsFunction.name
    );
    expect(
      await followeePos[0]
        .getFollowSnsNeuronsByTopicFolloweePo()
        .getNeuronHashPo()
        .getFullText()
    ).toBe("010203");

    // followee 2
    expect(await followeePos[1].getNsFunctionName()).toBe(
      genericNsFunction.name
    );
    expect(
      await followeePos[1]
        .getFollowSnsNeuronsByTopicFolloweePo()
        .getNeuronHashPo()
        .getFullText()
    ).toBe("040506");
  });

  it("calls callbacks when clicking next and back buttons", async () => {
    const openNextStep = vi.fn();
    const openPrevStep = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      openNextStep,
      openPrevStep,
    });

    await po.clickNextButton();
    expect(openNextStep).toHaveBeenCalledTimes(1);

    await po.clickBackButton();
    expect(openPrevStep).toHaveBeenCalledTimes(1);
  });
});
