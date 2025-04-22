import FollowSnsNeuronsByTopicStepTopics from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepTopics.svelte";
import type { SnsTopicFollowing, SnsTopicKey } from "$lib/types/sns";
import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { FollowSnsNeuronsByTopicStepTopicsPo } from "$tests/page-objects/FollowSnsNeuronsByTopicStepTopics.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type {
  SnsNervousSystemFunction,
  SnsNeuron,
  SnsNeuronId,
} from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("FollowSnsNeuronsByTopicStepTopics", () => {
  // legacy followees
  const legacyNsFunction1Name = "Legacy Function 1";
  const legacyNsFunction1: SnsNervousSystemFunction = {
    ...nervousSystemFunctionMock,
    name: legacyNsFunction1Name,
    id: 0n,
  };
  const legacyNsFunction2Name = "Legacy Function 2";
  const legacyNsFunction2: SnsNervousSystemFunction = {
    ...nervousSystemFunctionMock,
    name: legacyNsFunction2Name,
    id: 1n,
  };
  const legacyFolloweeNeuronId1: SnsNeuronId = {
    ...nervousSystemFunctionMock,
    id: [1, 2, 3, 4],
  };
  const legacyFolloweeNeuronId2: SnsNeuronId = {
    id: [5, 6, 7, 8],
  };
  // followings by topic
  const criticalTopicKey1: SnsTopicKey = "CriticalDappOperations";
  const criticalTopicName1 = "Critical Dapp Operations";
  const criticalTopicDescription1 = "Critical topic description 1";
  const criticalTopicInfo1: TopicInfoWithUnknown = {
    native_functions: [[legacyNsFunction1]],
    topic: [
      {
        [criticalTopicKey1]: null,
      },
    ],
    is_critical: [true],
    name: [criticalTopicName1],
    description: [criticalTopicDescription1],
    custom_functions: [[]],
  };
  const criticalTopicKey2: SnsTopicKey = "TreasuryAssetManagement";
  const criticalTopicName2 = "Treasury Asset Management";
  const criticalTopicDescription2 = "Critical topic description 2";
  const criticalTopicInfo2: TopicInfoWithUnknown = {
    native_functions: [[]],
    topic: [
      {
        [criticalTopicKey2]: null,
      },
    ],
    is_critical: [true],
    name: [criticalTopicName2],
    description: [criticalTopicDescription2],
    custom_functions: [[]],
  };
  const topicKey1: SnsTopicKey = "DaoCommunitySettings";
  const topicName1 = "Dao Community Settings";
  const topicDescription1 = "Topic description 1";
  const topicInfo1: TopicInfoWithUnknown = {
    native_functions: [[]],
    topic: [
      {
        [topicKey1]: null,
      },
    ],
    is_critical: [false],
    name: [topicName1],
    description: [topicDescription1],
    custom_functions: [[]],
  };
  const topicKey2: SnsTopicKey = "ApplicationBusinessLogic";
  const topicName2 = "Application Business Logic";
  const topicDescription2 = "Topic description 2";
  const topicInfo2: TopicInfoWithUnknown = {
    native_functions: [[legacyNsFunction2]],
    topic: [
      {
        [topicKey2]: null,
      },
    ],
    is_critical: [false],
    name: [topicName2],
    description: [topicDescription2],
    custom_functions: [[]],
  };

  const renderComponent = (props: {
    neuron: SnsNeuron;
    selectedTopics: SnsTopicKey[];
    topicInfos: TopicInfoWithUnknown[];
    followings: SnsTopicFollowing[];
    closeModal: () => void;
    openNextStep: () => void;
    removeFollowing: (args: {
      topicKey: SnsTopicKey;
      neuronId: SnsNeuronId;
    }) => void;
    removeLegacyFollowing: (args: {
      nsFunction: SnsNervousSystemFunction;
      followee: SnsNeuronId;
    }) => void;
  }) => {
    const { container } = render(FollowSnsNeuronsByTopicStepTopics, {
      props,
    });

    return FollowSnsNeuronsByTopicStepTopicsPo.under(
      new JestPageObjectElement(container)
    );
  };
  const defaultProps = {
    neuron: mockSnsNeuron,
    selectedTopics: [],
    topicInfos: [],
    followings: [],
    closeModal: vi.fn(),
    openNextStep: vi.fn(),
    removeFollowing: vi.fn(),
    removeLegacyFollowing: vi.fn(),
  };

  it("displays critical and non-critical topics", async () => {
    const po = renderComponent({
      ...defaultProps,
      topicInfos: [
        criticalTopicInfo1,
        topicInfo1,
        criticalTopicInfo2,
        topicInfo2,
      ],
    });

    expect(await po.getCriticalTopicItemNames()).toEqual([
      criticalTopicName1,
      criticalTopicName2,
    ]);
    expect(await po.getNonCriticalTopicItemNames()).toEqual([
      topicName1,
      topicName2,
    ]);
    expect(await po.getCriticalTopicItemDescriptions()).toEqual([
      criticalTopicDescription1,
      criticalTopicDescription2,
    ]);
    expect(await po.getNonCriticalTopicItemDescriptions()).toEqual([
      topicDescription1,
      topicDescription2,
    ]);
  });

  it("displays status icon", async () => {
    const testFollowee = {
      neuronId: {
        id: Uint8Array.from([0, 1, 2]),
      },
    };
    const po = renderComponent({
      ...defaultProps,
      topicInfos: [
        criticalTopicInfo1,
        topicInfo1,
        criticalTopicInfo2,
        topicInfo2,
      ],
      followings: [
        {
          topic: criticalTopicKey1,
          followees: [testFollowee],
        },
        {
          topic: topicKey1,
          followees: [testFollowee],
        },
      ],
    });

    expect(
      await (
        await po.getTopicItemPoByName(criticalTopicName1)
      ).hasFollowingStatusIcon()
    ).toEqual(true);
    expect(
      await (
        await po.getTopicItemPoByName(criticalTopicName2)
      ).hasFollowingStatusIcon()
    ).toEqual(false);
    expect(
      await (await po.getTopicItemPoByName(topicName1)).hasFollowingStatusIcon()
    ).toEqual(true);
    expect(
      await (await po.getTopicItemPoByName(topicName2)).hasFollowingStatusIcon()
    ).toEqual(false);
  });

  it("binds topic selection", async () => {
    const props = $state({
      ...defaultProps,
      topicInfos: [
        criticalTopicInfo1,
        criticalTopicInfo2,
        topicInfo1,
        topicInfo2,
      ],
      selectedTopics: [topicKey1, criticalTopicKey1],
    });
    const po = renderComponent(props);

    expect(await po.getTopicSelectionByName(criticalTopicName1)).toEqual(true);
    expect(await po.getTopicSelectionByName(criticalTopicName2)).toEqual(false);
    expect(await po.getTopicSelectionByName(topicName1)).toEqual(true);
    expect(await po.getTopicSelectionByName(topicName2)).toEqual(false);
    expect([...props.selectedTopics].sort()).toEqual(
      [criticalTopicKey1, topicKey1].sort()
    );

    await po.clickTopicItemByName(criticalTopicName1);
    expect(await po.getTopicSelectionByName(criticalTopicName1)).toEqual(false);
    expect(await po.getTopicSelectionByName(criticalTopicName2)).toEqual(false);
    expect(await po.getTopicSelectionByName(topicName1)).toEqual(true);
    expect(await po.getTopicSelectionByName(topicName2)).toEqual(false);
    expect([...props.selectedTopics]).toEqual([topicKey1]);

    await po.clickTopicItemByName(criticalTopicName2);
    expect(await po.getTopicSelectionByName(criticalTopicName1)).toEqual(false);
    expect(await po.getTopicSelectionByName(criticalTopicName2)).toEqual(true);
    expect(await po.getTopicSelectionByName(topicName1)).toEqual(true);
    expect(await po.getTopicSelectionByName(topicName2)).toEqual(false);
    expect([...props.selectedTopics].sort()).toEqual(
      [criticalTopicKey2, topicKey1].sort()
    );

    await po.clickTopicItemByName(topicName2);
    expect(await po.getTopicSelectionByName(criticalTopicName1)).toEqual(false);
    expect(await po.getTopicSelectionByName(criticalTopicName2)).toEqual(true);
    expect(await po.getTopicSelectionByName(topicName1)).toEqual(true);
    expect(await po.getTopicSelectionByName(topicName2)).toEqual(true);
    expect([...props.selectedTopics].sort()).toEqual(
      [criticalTopicKey2, topicKey1, topicKey2].sort()
    );
  });

  it("calls callbacks", async () => {
    const closeModal = vi.fn();
    const openNextStep = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      closeModal,
      openNextStep,
    });

    expect(await po.getCancelButtonPo().isPresent()).toBe(true);
    expect(await po.getNextButtonPo().isPresent()).toBe(true);
    await po.clickCancelButton();
    expect(closeModal).toBeCalledTimes(1);
    await po.clickNextButton();
    expect(openNextStep).toBeCalledTimes(1);
  });

  describe("legacy followees", () => {
    it("displays legacy followees", async () => {
      const po = renderComponent({
        ...defaultProps,
        neuron: {
          ...mockSnsNeuron,
          followees: [
            [
              // Assigned to criticalTopicInfo1
              legacyNsFunction1.id,
              {
                followees: [
                  // legacyFollowee1
                  legacyFolloweeNeuronId1,
                ],
              },
            ],
            [
              // Assigned to topicInfo2
              legacyNsFunction2.id,
              {
                followees: [
                  // legacyFollowee2
                  legacyFolloweeNeuronId1,
                  // legacyFollowee3
                  legacyFolloweeNeuronId2,
                ],
              },
            ],
          ],
        },
        topicInfos: [
          criticalTopicInfo1,
          criticalTopicInfo2,
          topicInfo1,
          topicInfo2,
        ],
      });

      expect(
        (await po.getFollowSnsNeuronsByTopicLegacyFolloweePos()).length
      ).toEqual(3);

      const [legacyFollowee1Po] = await (
        await po.getTopicItemPoByName(criticalTopicName1)
      ).getFollowSnsNeuronsByTopicLegacyFolloweePos();
      expect(await legacyFollowee1Po.getNsFunctionName()).toEqual(
        legacyNsFunction1Name
      );
      expect(
        await legacyFollowee1Po
          .getFollowSnsNeuronsByTopicFolloweePo()
          .getNeuronHashPo()
          .getFullText()
      ).toEqual("01020304");

      const [legacyFollowee2Po, legacyFollowee3Po] = await (
        await po.getTopicItemPoByName(topicName2)
      ).getFollowSnsNeuronsByTopicLegacyFolloweePos();
      expect(await legacyFollowee2Po.getNsFunctionName()).toEqual(
        legacyNsFunction2Name
      );
      expect(
        await legacyFollowee2Po
          .getFollowSnsNeuronsByTopicFolloweePo()
          .getNeuronHashPo()
          .getFullText()
      ).toEqual("01020304");

      expect(await legacyFollowee3Po.getNsFunctionName()).toEqual(
        legacyNsFunction2Name
      );
      expect(
        await legacyFollowee3Po
          .getFollowSnsNeuronsByTopicFolloweePo()
          .getNeuronHashPo()
          .getFullText()
      ).toEqual("05060708");
    });

    it("doesn't displays legacy followees when empty", async () => {
      const po = renderComponent({
        ...defaultProps,
        neuron: {
          ...mockSnsNeuron,
          followees: [],
        },
        topicInfos: [
          criticalTopicInfo1,
          criticalTopicInfo2,
          topicInfo1,
          topicInfo2,
        ],
      });

      expect(
        (await po.getFollowSnsNeuronsByTopicLegacyFolloweePos()).length
      ).toEqual(0);
    });
  });
});
