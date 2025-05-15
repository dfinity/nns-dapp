import FollowSnsNeuronsByTopicStepNeuron from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepNeuron.svelte";
import { FollowSnsNeuronsByTopicStepNeuronPo } from "$tests/page-objects/FollowSnsNeuronsByTopicStepNeuron.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

describe("FollowSnsNeuronsByTopicStepNeuron", () => {
  const renderComponent = (props: {
    followeeHex: string;
    openPrevStep: () => void;
    addFollowing: (followeeHex: string) => void;
  }) => {
    const { container } = render(FollowSnsNeuronsByTopicStepNeuron, {
      props,
    });

    return FollowSnsNeuronsByTopicStepNeuronPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("binds neuron hex field", async () => {
    const props = $state({
      followeeHex: "1234",
      openPrevStep: vi.fn(),
      addFollowing: vi.fn(),
    });
    const po = renderComponent(props);

    expect(await po.getNeuronIdValue()).toEqual("1234");
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(false);

    await po.getNeuronIdInputPo().typeText("");
    expect(props.followeeHex).toEqual("");

    props.followeeHex = "ABC";
    await runResolvedPromises();
    expect(await po.getNeuronIdValue()).toEqual("ABC");
  });

  it("disables confirm button", async () => {
    const po = renderComponent({
      followeeHex: "",
      openPrevStep: vi.fn(),
      addFollowing: vi.fn(),
    });
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(true);

    await po.getNeuronIdInputPo().typeText("1234");
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(false);

    await po.getNeuronIdInputPo().typeText("");
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(true);
  });

  it("calls callbacks", async () => {
    const props = $state({
      followeeHex: "1234",
      openPrevStep: vi.fn(),
      addFollowing: vi.fn(),
    });
    const po = renderComponent(props);

    await po.clickBackButton();
    expect(props.openPrevStep).toHaveBeenCalledTimes(1);

    await po.clickConfirmButton();
    expect(props.addFollowing).toHaveBeenCalledTimes(1);
    expect(props.addFollowing).toHaveBeenCalledWith("1234");

    props.followeeHex = "5678";
    await po.clickConfirmButton();
    expect(props.addFollowing).toHaveBeenCalledTimes(2);
    expect(props.addFollowing).toHaveBeenCalledWith("5678");
  });

  it("displays an error", async () => {
    const props = $state({
      followeeHex: "1234",
      errorMessage: "test error",
      openPrevStep: vi.fn(),
      addFollowing: vi.fn(),
    });
    const po = renderComponent(props);

    expect(await po.getNeuronIdInputPo().getErrorMessage()).toEqual(
      "test error"
    );
  });

  it("hides an error on change", async () => {
    const props = $state({
      followeeHex: "1234",
      errorMessage: "test error",
      openPrevStep: vi.fn(),
      addFollowing: vi.fn(),
    });
    const po = renderComponent(props);

    expect(await po.getNeuronIdInputPo().getErrorMessage()).toEqual(
      "test error"
    );
    await po.getNeuronIdInputPo().typeText("1234");
    expect(await po.getNeuronIdInputPo().getErrorMessage()).toBe(null);
  });
});
