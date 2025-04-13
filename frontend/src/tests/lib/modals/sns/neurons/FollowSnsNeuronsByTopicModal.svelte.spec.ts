import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import FollowSnsNeuronsByTopicModal from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicModal.svelte";
import type { SnsTopicKey } from "$lib/types/sns";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { topicInfoDtoMock } from "$tests/mocks/sns-topics.mock";
import { FollowSnsNeuronsByTopicModalPo } from "$tests/page-objects/FollowSnsNeuronsByTopicModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { busyStore, toastsStore } from "@dfinity/gix-components";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
import {
  arrayOfNumberToUint8Array,
  fromNullable,
  nonNullish,
} from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

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

  const renderComponent = (
    props: {
      rootCanisterId: Principal;
      neuron: SnsNeuron;
      reloadNeuron: () => Promise<void>;
    },
    onNnsClose?: () => void
  ) => {
    const { container } = render(FollowSnsNeuronsByTopicModal, {
      props,
      events: {
        ...(nonNullish(onNnsClose) && { nnsClose: onNnsClose }),
      },
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
    resetIdentity();

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
    const newFolloweeNeuronIdHex = "040506";
    const newFolloweeNeuronId: SnsNeuronId = {
      id: arrayOfNumberToUint8Array([4, 5, 6]),
    };
    let resolveQuerySnsNeuron;
    const querySnsNeuronSpy = vi
      .spyOn(snsGovernanceApi, "querySnsNeuron")
      .mockImplementation(
        () => new Promise((resolve) => (resolveQuerySnsNeuron = resolve))
      );
    let resolveSetFollowing;
    const setFollowingSpy = vi
      .spyOn(snsGovernanceApi, "setFollowing")
      .mockImplementation(
        () => new Promise((resolve) => (resolveSetFollowing = resolve))
      );
    const reloadNeuronSpy = vi.fn();
    const onNnsCloseSpy = vi.fn();
    const po = renderComponent(
      {
        ...defaultProps,
        reloadNeuron: reloadNeuronSpy,
      },
      onNnsCloseSpy
    );

    // Select a topic
    const topicsStepPo = await po.getFollowSnsNeuronsByTopicStepTopicsPo();
    expect(await topicsStepPo.isPresent()).toEqual(true);
    expect(await topicsStepPo.getNextButtonPo().isDisabled()).toEqual(true);
    await topicsStepPo.clickTopicItemByName(criticalTopicName2);
    expect(await topicsStepPo.getNextButtonPo().isDisabled()).toEqual(false);
    await topicsStepPo.clickNextButton();

    // Type neuron id
    const neuronStepPo = await po.getFollowSnsNeuronsByTopicStepNeuronPo();
    expect(await neuronStepPo.isPresent()).toEqual(true);
    expect(await topicsStepPo.isPresent()).toEqual(false);
    expect(await neuronStepPo.getConfirmButtonPo().isDisabled()).toEqual(true);
    await neuronStepPo.getNeuronIdInputPo().typeText(newFolloweeNeuronIdHex);
    expect(await neuronStepPo.getConfirmButtonPo().isDisabled()).toEqual(false);

    // Confirmation
    await neuronStepPo.clickConfirmButton();
    await runResolvedPromises();

    // Expect busy to be shown
    expect(get(busyStore)).toEqual([
      {
        initiator: "add-followee-by-topic",
        text: undefined,
      },
    ]);
    expect(get(toastsStore)).toEqual([]);

    // Neuron id validation request
    expect(querySnsNeuronSpy).toBeCalledTimes(1);
    expect(querySnsNeuronSpy).toBeCalledWith({
      identity: mockIdentity,
      rootCanisterId,
      certified: false,
      neuronId: newFolloweeNeuronId,
    });
    expect(setFollowingSpy).toBeCalledTimes(0);

    resolveQuerySnsNeuron(neuron);
    await runResolvedPromises();

    // Set following request
    expect(setFollowingSpy).toBeCalledTimes(1);
    expect(setFollowingSpy).toBeCalledWith({
      neuronId: fromNullable(neuron.id),
      identity: mockIdentity,
      rootCanisterId,
      topicFollowing: [
        {
          topic: { [criticalTopicKey2]: null },
          followees: [{ neuronId: newFolloweeNeuronId }],
        },
      ],
    });

    expect(reloadNeuronSpy).toBeCalledTimes(0);
    expect(onNnsCloseSpy).toBeCalledTimes(0);
    resolveSetFollowing();
    await runResolvedPromises();

    // After successful set following
    expect(reloadNeuronSpy).toBeCalledTimes(1);
    expect(onNnsCloseSpy).toBeCalledTimes(1);
    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "The voting delegation was successfully added.",
      },
    ]);
  });

  it("handles set following error", async () => {
    const testError = new Error("Test Error");
    const spyConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const newFolloweeNeuronIdHex = "040506";
    vi.spyOn(snsGovernanceApi, "querySnsNeuron").mockResolvedValue(neuron);
    let rejectSetFollowing;
    const setFollowingSpy = vi
      .spyOn(snsGovernanceApi, "setFollowing")
      .mockImplementation(
        () => new Promise((_, reject) => (rejectSetFollowing = reject))
      );
    const reloadNeuronSpy = vi.fn();
    const onNnsCloseSpy = vi.fn();
    const po = renderComponent(
      {
        ...defaultProps,
        reloadNeuron: reloadNeuronSpy,
      },
      onNnsCloseSpy
    );

    const topicsStepPo = await po.getFollowSnsNeuronsByTopicStepTopicsPo();
    await topicsStepPo.clickTopicItemByName(criticalTopicName2);
    await topicsStepPo.clickNextButton();
    const neuronStepPo = await po.getFollowSnsNeuronsByTopicStepNeuronPo();
    await neuronStepPo.getNeuronIdInputPo().typeText(newFolloweeNeuronIdHex);
    await neuronStepPo.clickConfirmButton();
    await runResolvedPromises();

    expect(get(busyStore)).toEqual([
      {
        initiator: "add-followee-by-topic",
        text: undefined,
      },
    ]);
    expect(get(toastsStore)).toEqual([]);
    expect(spyConsoleError).toBeCalledTimes(0);
    expect(setFollowingSpy).toBeCalledTimes(1);

    // Reject set following
    rejectSetFollowing(testError);
    await runResolvedPromises();

    expect(spyConsoleError).toBeCalledTimes(1);
    expect(spyConsoleError).toBeCalledWith(testError);
    expect(reloadNeuronSpy).toBeCalledTimes(0);
    expect(onNnsCloseSpy).toBeCalledTimes(0);
    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "error",
        text: "There was an error while adding a followee. Test Error",
      },
    ]);
  });

  it("handles provided invalid neuron id", async () => {
    const newFolloweeNeuronIdHex = "040506";
    let rejectQuerySnsNeuron;
    vi.spyOn(snsGovernanceApi, "querySnsNeuron").mockImplementation(
      () => new Promise((_, reject) => (rejectQuerySnsNeuron = reject))
    );
    const setFollowingSpy = vi
      .spyOn(snsGovernanceApi, "setFollowing")
      .mockResolvedValue();
    const reloadNeuronSpy = vi.fn();
    const onNnsCloseSpy = vi.fn();
    const po = renderComponent(
      {
        ...defaultProps,
        reloadNeuron: reloadNeuronSpy,
      },
      onNnsCloseSpy
    );

    const topicsStepPo = await po.getFollowSnsNeuronsByTopicStepTopicsPo();
    await topicsStepPo.clickTopicItemByName(criticalTopicName2);
    await topicsStepPo.clickNextButton();
    const neuronStepPo = await po.getFollowSnsNeuronsByTopicStepNeuronPo();
    await neuronStepPo.getNeuronIdInputPo().typeText(newFolloweeNeuronIdHex);

    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toEqual([]);
    await neuronStepPo.clickConfirmButton();

    expect(get(busyStore)).toEqual([
      {
        initiator: "add-followee-by-topic",
        text: undefined,
      },
    ]);
    expect(get(toastsStore)).toEqual([]);

    rejectQuerySnsNeuron();
    await runResolvedPromises();

    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "error",
        text: "Neuron with id 040506 does not exist.",
      },
    ]);

    expect(setFollowingSpy).toBeCalledTimes(0);
    expect(reloadNeuronSpy).toBeCalledTimes(0);
    expect(onNnsCloseSpy).toBeCalledTimes(0);
  });

  it("preserves user entered data between step navigation", async () => {
    const po = renderComponent({
      ...defaultProps,
    });

    const topicsStepPo = await po.getFollowSnsNeuronsByTopicStepTopicsPo();
    await topicsStepPo.clickTopicItemByName(criticalTopicName2);
    await topicsStepPo.clickTopicItemByName(topicName1);
    await topicsStepPo.clickNextButton();

    const neuronStepPo = await po.getFollowSnsNeuronsByTopicStepNeuronPo();
    await neuronStepPo.getNeuronIdInputPo().typeText("1234");
    await neuronStepPo.clickBackButton();

    expect(
      await topicsStepPo.getTopicSelectionByName(criticalTopicName1)
    ).toEqual(false);
    expect(
      await topicsStepPo.getTopicSelectionByName(criticalTopicName2)
    ).toEqual(true);
    expect(await topicsStepPo.getTopicSelectionByName(topicName1)).toEqual(
      true
    );
    expect(await topicsStepPo.getTopicSelectionByName(topicName2)).toEqual(
      false
    );
    await topicsStepPo.clickNextButton();
    expect(await neuronStepPo.getNeuronIdValue()).toEqual("1234");
    expect(await neuronStepPo.getConfirmButtonPo().isDisabled()).toEqual(false);
  });
});
