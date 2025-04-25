import FollowSnsNeuronsByTopicStepDeactivateCatchAll from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepDeactivateCatchAll.svelte";
import type { SnsLegacyFollowings } from "$lib/types/sns";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { FollowSnsNeuronsByTopicStepDeactivateCatchAllPo } from "$tests/page-objects/FollowSnsNeuronsByTopicStepDeactivateCatchAll.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("FollowSnsNeuronsByTopicStepDeactivateCatchAll", () => {
  const catchAllName = "All-not-critical topics";
  const catchAllNsFunction = {
    ...nativeNervousSystemFunctionMock,
    id: 0n,
    name: catchAllName,
  };
  const neuronId1 = {
    id: Uint8Array.from([1, 2, 3]),
  };
  const neuronId2 = {
    id: Uint8Array.from([4, 5, 6]),
  };

  const renderComponent = (props: {
    catchAllLegacyFollowings: SnsLegacyFollowings;
    confirm: () => void;
    cancel: () => void;
  }) => {
    const { container } = render(
      FollowSnsNeuronsByTopicStepDeactivateCatchAll,
      {
        props,
      }
    );

    return FollowSnsNeuronsByTopicStepDeactivateCatchAllPo.under(
      new JestPageObjectElement(container)
    );
  };
  const defaultProps = {
    catchAllLegacyFollowings: {
      nsFunction: catchAllNsFunction,
      followees: [neuronId1, neuronId2],
    },
    confirm: vi.fn(),
    cancel: vi.fn(),
  };

  it("displays legacy 'Catch-all' followings", async () => {
    const po = renderComponent({
      ...defaultProps,
      catchAllLegacyFollowings: {
        nsFunction: catchAllNsFunction,
        followees: [neuronId1, neuronId2],
      },
    });

    const followeePos = await po.getFollowSnsNeuronsByTopicLegacyFolloweePos();
    expect(followeePos.length).toBe(2);

    // followee 1
    expect(await followeePos[0].getNsFunctionName()).toBe(catchAllName);
    expect(
      await followeePos[0]
        .getFollowSnsNeuronsByTopicFolloweePo()
        .getNeuronHashPo()
        .getFullText()
    ).toBe("010203");

    // followee 2
    expect(await followeePos[1].getNsFunctionName()).toBe(catchAllName);
    expect(
      await followeePos[1]
        .getFollowSnsNeuronsByTopicFolloweePo()
        .getNeuronHashPo()
        .getFullText()
    ).toBe("040506");
  });

  it("calls callbacks when clicking the buttons", async () => {
    const confirmSpy = vi.fn();
    const cancelSpy = vi.fn();
    const po = renderComponent({
      ...defaultProps,
      confirm: confirmSpy,
      cancel: cancelSpy,
    });

    await po.clickCancelButton();
    expect(cancelSpy).toHaveBeenCalledTimes(1);

    await po.clickConfirmButton();
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });
});
