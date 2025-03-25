import FollowSnsNeuronsByTopicStepNeuron from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepNeuron.svelte";
import { FollowSnsNeuronsByTopicStepNeuronPo } from "$tests/page-objects/FollowSnsNeuronsByTopicStepNeuron.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("FollowSnsNeuronsByTopicStepNeuron", () => {
  const renderComponent = (props: {
    followeeHex: string;
    onNnsBack: () => void;
    onNnsConfirm: (followeeHex: string) => void;
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
      onNnsBack: vi.fn(),
      onNnsConfirm: vi.fn(),
    });
    const po = renderComponent(props);

    expect(await po.getNeuronIdValue()).toEqual("1234");
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(false);

    await po.getNeuronIdInputPo().typeText("");
    expect(props.followeeHex).toEqual("");

    props.followeeHex = "ABC";
    expect(await po.getNeuronIdValue()).toEqual("ABC");
  });

  it("disables confirm button", async () => {
    const po = renderComponent({
      followeeHex: "",
      onNnsBack: vi.fn(),
      onNnsConfirm: vi.fn(),
    });
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(true);

    await po.getNeuronIdInputPo().typeText("1234");
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(false);

    await po.getNeuronIdInputPo().typeText("");
    expect(await po.getConfirmButtonPo().isDisabled()).toBe(true);
  });

  it("emits events", async () => {
    const props = $state({
      followeeHex: "1234",
      onNnsBack: vi.fn(),
      onNnsConfirm: vi.fn(),
    });
    const po = renderComponent(props);

    await po.clickBackButton();
    expect(props.onNnsBack).toHaveBeenCalledTimes(1);

    await po.clickConfirmButton();
    expect(props.onNnsConfirm).toHaveBeenCalledTimes(1);
    expect(props.onNnsConfirm).toHaveBeenCalledWith("1234");

    props.followeeHex = "5678";
    await po.clickConfirmButton();
    expect(props.onNnsConfirm).toHaveBeenCalledTimes(2);
    expect(props.onNnsConfirm).toHaveBeenCalledWith("5678");
  });
});
