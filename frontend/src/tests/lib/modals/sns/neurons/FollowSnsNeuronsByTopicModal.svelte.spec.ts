import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import FollowSnsNeuronsByTopicModal from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicModal.svelte";
import type { SnsTopicKey } from "$lib/types/sns";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { topicInfoDtoMock } from "$tests/mocks/sns-topics.mock";
import { FollowSnsNeuronsByTopicModalPo } from "$tests/page-objects/FollowSnsNeuronsByTopicModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
import { arrayOfNumberToUint8Array, fromNullable } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("FollowSnsNeuronsByTopicModal", () => {
  const rootCanisterId = principal(1);
  const criticalTopicKey1: SnsTopicKey = "CriticalDappOperations";
  const criticalTopicName1 = "Critical Dapp Operations";
  const criticalTopicKey2: SnsTopicKey = "TreasuryAssetManagement";
  const criticalTopicName2 = "Treasury Asset Management";
  const topicKey1: SnsTopicKey = "DaoCommunitySettings";
  const topicName1 = "Dao Community Settings";
  const topicKey2: SnsTopicKey = "ApplicationBusinessLogic";
  const topicName2 = "Application Business Logic";
  const followeeNeuronId1 = {
    id: Uint8Array.from([1, 2, 3]),
  };
  const neuron = createMockSnsNeuron({
    sourceNnsNeuronId: 0n,
    topicFollowees: {
      [criticalTopicKey1]: [
        {
          neuronId: followeeNeuronId1,
        },
      ],
    },
  });

  const renderComponent = (props: {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
    reloadNeuron: () => Promise<void>;
  }) => {
    const { container } = render(FollowSnsNeuronsByTopicModal, {
      props,
    });

    return FollowSnsNeuronsByTopicModalPo.under(
      new JestPageObjectElement(container)
    );
  };
  const defaultProps = {
    rootCanisterId,
    neuron,
    reloadNeuron: vi.fn(),
  };

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId,
        topics: {
          topics: [
            topicInfoDtoMock({
              topic: criticalTopicKey1,
              name: criticalTopicName1,
              description: "",
              isCritical: true,
            }),
            topicInfoDtoMock({
              topic: criticalTopicKey2,
              name: criticalTopicName2,
              description: "",
              isCritical: true,
            }),
            topicInfoDtoMock({
              topic: topicKey1,
              name: topicName1,
              description: "",
              isCritical: false,
            }),
            topicInfoDtoMock({
              topic: topicKey2,
              name: topicName2,
              description: "",
              isCritical: false,
            }),
          ],
          uncategorized_functions: [],
        },
      },
    ]);
  });

  it("displays initially topics step", async () => {
    const po = renderComponent({
      ...defaultProps,
    });

    expect(
      await po.getFollowSnsNeuronsByTopicStepNeuronPo().isPresent()
    ).toEqual(false);
    const topicsStepPo = await po.getFollowSnsNeuronsByTopicStepTopicsPo();
    expect(await topicsStepPo.isPresent()).toEqual(true);
    expect(await topicsStepPo.getCriticalTopicItemNames()).toEqual([
      criticalTopicName1,
      criticalTopicName2,
    ]);
    expect(await topicsStepPo.getNonCriticalTopicItemNames()).toEqual([
      topicName1,
      topicName2,
    ]);
  });

  it("updates following for selected topics", async () => {
    const setFollowingSpy = vi
      .spyOn(snsGovernanceApi, "setFollowing")
      .mockImplementation(() => Promise.resolve());
    const reloadNeuronSpy = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      reloadNeuron: reloadNeuronSpy,
    });

    // Select critical topic
    const topicsStepPo = await po.getFollowSnsNeuronsByTopicStepTopicsPo();
    expect(await topicsStepPo.isPresent()).toEqual(true);
    expect(await topicsStepPo.getNextButtonPo().isDisabled()).toEqual(true);
    await topicsStepPo.clickTopicItemByName(criticalTopicName2);
    expect(await topicsStepPo.getNextButtonPo().isDisabled()).toEqual(false);

    // Goto neuron step
    await topicsStepPo.clickNextButton();
    const neuronStepPo = await po.getFollowSnsNeuronsByTopicStepNeuronPo();
    expect(await neuronStepPo.isPresent()).toEqual(true);
    expect(
      await po.getFollowSnsNeuronsByTopicStepTopicsPo().isPresent()
    ).toEqual(false);
    expect(await neuronStepPo.getConfirmButtonPo().isDisabled()).toEqual(true);
    await neuronStepPo.getNeuronIdInputPo().typeText("040506");
    expect(await neuronStepPo.getConfirmButtonPo().isDisabled()).toEqual(false);

    // Confirm setting following
    await neuronStepPo.getConfirmButtonPo().click();
    await runResolvedPromises();

    expect(setFollowingSpy).toBeCalledTimes(1);
    expect(setFollowingSpy).toBeCalledWith({
      neuronId: fromNullable(neuron.id),
      identity: mockIdentity,
      rootCanisterId,
      topicFollowing: [
        {
          topic: { [criticalTopicKey2]: null },
          followees: [
            {
              id: arrayOfNumberToUint8Array([4, 5, 6]),
            } as SnsNeuronId,
          ],
        },
      ],
    });
    expect(reloadNeuronSpy).toBeCalledTimes(1);
  });
});
