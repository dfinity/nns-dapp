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
import { arrayOfNumberToUint8Array, fromNullable } from "@dfinity/utils";
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
  const followeeNeuronId2 = {
    id: Uint8Array.from([3, 2, 1]),
  };
  const neuron = createMockSnsNeuron({
    sourceNnsNeuronId: 0n,
    topicFollowees: {
      [criticalTopicKey1]: [
        {
          neuronId: followeeNeuronId1,
        },
        {
          neuronId: followeeNeuronId2,
        },
      ],
    },
  });

  const renderComponent = (props: {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
    reloadNeuron: () => Promise<void>;
    closeModal: () => void;
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
    closeModal: vi.fn(),
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

  it('calls close modal on "Cancel" click', async () => {
    const closeModal = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      closeModal,
    });

    po.getFollowSnsNeuronsByTopicStepTopicsPo().clickCancelButton();

    await runResolvedPromises();
    expect(closeModal).toHaveBeenCalledTimes(1);
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

  it("updates following for selected topics", async () => {
    const newFolloweeNeuronIdHex = "040506";
    const newFolloweeNeuronId: SnsNeuronId = {
      id: arrayOfNumberToUint8Array([4, 5, 6]),
    };
    let resolveSetFollowing;
    const setFollowingSpy = vi
      .spyOn(snsGovernanceApi, "setFollowing")
      .mockImplementation(
        () => new Promise((resolve) => (resolveSetFollowing = resolve))
      );
    const reloadNeuronSpy = vi.fn();
    const closeModalSpy = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      reloadNeuron: reloadNeuronSpy,
      closeModal: closeModalSpy,
    });

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
        text: "Updating neuron followings",
      },
    ]);
    expect(get(toastsStore)).toEqual([]);

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
    expect(closeModalSpy).toBeCalledTimes(0);
    resolveSetFollowing();
    await runResolvedPromises();

    // After successful set following
    expect(reloadNeuronSpy).toBeCalledTimes(1);
    expect(closeModalSpy).toBeCalledTimes(1);
    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "The neuron following was successfully added.",
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
    const closeModalSpy = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      reloadNeuron: reloadNeuronSpy,
      closeModal: closeModalSpy,
    });

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
        text: "Updating neuron followings",
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
    expect(closeModalSpy).toBeCalledTimes(0);
    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "error",
        text: "There was an error while adding a followee. Test Error",
      },
    ]);
  });

  it("removes followee", async () => {
    let resolveSetFollowing;
    const setFollowingSpy = vi
      .spyOn(snsGovernanceApi, "setFollowing")
      .mockImplementation(
        () => new Promise((resolve) => (resolveSetFollowing = resolve))
      );
    const reloadNeuronSpy = vi.fn();
    const closeModalSpy = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      reloadNeuron: reloadNeuronSpy,
      closeModal: closeModalSpy,
    });
    const topicsStepPo = po.getFollowSnsNeuronsByTopicStepTopicsPo();
    const followeePos =
      await topicsStepPo.getTopicFolloweePos(criticalTopicName1);

    expect(followeePos.length).toEqual(2);

    expect(get(busyStore)).toEqual([]);
    await followeePos[0].clickRemoveButton();
    await runResolvedPromises();

    expect(get(busyStore)).toEqual([
      {
        initiator: "remove-followee-by-topic",
        text: "Removing neuron following",
      },
    ]);
    expect(setFollowingSpy).toBeCalledTimes(1);
    expect(setFollowingSpy).toBeCalledWith({
      neuronId: fromNullable(neuron.id),
      identity: mockIdentity,
      rootCanisterId,
      topicFollowing: [
        {
          topic: { [criticalTopicKey1]: null },
          followees: [
            {
              neuronId: followeeNeuronId2,
            },
          ],
        },
      ],
    });

    expect(reloadNeuronSpy).toBeCalledTimes(0);

    resolveSetFollowing();
    await runResolvedPromises();

    expect(reloadNeuronSpy).toBeCalledTimes(1);
    expect(get(busyStore)).toEqual([]);
    // Shouldn't close the modal
    expect(closeModalSpy).toBeCalledTimes(0);
  });

  it("handles remove followee errors", async () => {
    const spyConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const testError = new Error("Test Error");
    let rejectSetFollowing;
    const setFollowingSpy = vi
      .spyOn(snsGovernanceApi, "setFollowing")
      .mockImplementation(
        () => new Promise((_, reject) => (rejectSetFollowing = reject))
      );
    const reloadNeuronSpy = vi.fn();
    const closeModalSpy = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      reloadNeuron: reloadNeuronSpy,
      closeModal: closeModalSpy,
    });
    const topicsStepPo = po.getFollowSnsNeuronsByTopicStepTopicsPo();
    const followeePos =
      await topicsStepPo.getTopicFolloweePos(criticalTopicName1);
    await followeePos[0].clickRemoveButton();
    await runResolvedPromises();

    expect(get(toastsStore)).toEqual([]);
    expect(setFollowingSpy).toBeCalledTimes(1);
    expect(setFollowingSpy).toBeCalledWith({
      neuronId: fromNullable(neuron.id),
      identity: mockIdentity,
      rootCanisterId,
      topicFollowing: [
        {
          topic: { [criticalTopicKey1]: null },
          followees: [
            {
              neuronId: followeeNeuronId2,
            },
          ],
        },
      ],
    });

    rejectSetFollowing(testError);
    await runResolvedPromises();

    expect(reloadNeuronSpy).toBeCalledTimes(0);
    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "error",
        text: "There was an error while adding a followee. Test Error",
      },
    ]);
    expect(spyConsoleError).toBeCalledTimes(1);
    expect(spyConsoleError).toBeCalledWith(testError);
    // Shouldn't close the modal
    expect(closeModalSpy).toBeCalledTimes(0);
  });
});
