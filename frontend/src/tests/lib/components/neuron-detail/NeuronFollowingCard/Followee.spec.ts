import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { FolloweePo } from "$tests/page-objects/Followee.page-object";
import { VotingHistoryModalPo } from "$tests/page-objects/VotingHistoryModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import FolloweeTest from "./FolloweeTest.svelte";

describe("Followee", () => {
  let copySpy;

  const followee = {
    neuronId: 111n,
    topics: [Topic.ExchangeRate, Topic.Governance, Topic.Kyc],
  };

  beforeEach(() => {
    knownNeuronsStore.reset();

    vi.spyOn(console, "error").mockReturnValue();
    copySpy = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: copySpy,
      },
    });
  });

  const renderComponent = () => {
    const { container } = render(FolloweeTest, {
      props: {
        followee,
      },
    });
    return FolloweePo.under(new JestPageObjectElement(container));
  };

  const renderComponentAndModal = () => {
    const { container } = render(FolloweeTest, {
      props: {
        followee,
      },
    });
    const element = new JestPageObjectElement(container);
    return {
      componentPo: FolloweePo.under(element),
      modalPo: VotingHistoryModalPo.under(element),
    };
  };

  it("should render neuronId", async () => {
    const po = renderComponent();
    expect(await po.getName()).toBe(followee.neuronId.toString());
  });

  it("should render topics", async () => {
    const po = renderComponent();
    expect(await po.getTags()).toEqual(["Exchange Rate", "Governance", "KYC"]);
  });

  it("should render ids", async () => {
    const id = `followee-${followee.neuronId}`;
    const po = renderComponent();
    expect(await po.getId()).toBe(id);
    expect(await po.getAriaLabeledBy()).toBe(id);
  });

  it("should open modal", async () => {
    const { componentPo, modalPo } = renderComponentAndModal();
    expect(await modalPo.isPresent()).toBe(false);
    await componentPo.openModal();
    expect(await modalPo.isPresent()).toBe(true);
  });

  it("should render known neurons name", async () => {
    const neuronName = "test-name";
    knownNeuronsStore.setNeurons([
      {
        id: followee.neuronId,
        name: neuronName,
        description: "test-description",
      },
    ]);

    const po = renderComponent();
    expect(await po.getName()).toBe(neuronName);
  });

  it("should copy neuron ID to clipboard when copy button is clicked", async () => {
    const po = renderComponent();

    expect(copySpy).not.toBeCalled();
    await po.copy();
    expect(copySpy).toBeCalledWith(`${followee.neuronId}`);
  });
});
