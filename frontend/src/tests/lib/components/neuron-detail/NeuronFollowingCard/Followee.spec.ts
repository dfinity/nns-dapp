import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { FolloweePo } from "$tests/page-objects/Followee.page-object";
import { VotingHistoryModalPo } from "$tests/page-objects/VotingHistoryModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import FolloweeTest from "$tests/lib/components/neuron-detail/NeuronFollowingCard/FolloweeTest.svelte";

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

  const renderComponent = (isInteractive = true) => {
    const { container } = render(FolloweeTest, {
      props: {
        followee,
        neuron: mockNeuron,
        isInteractive,
      },
    });
    return FolloweePo.under(new JestPageObjectElement(container));
  };

  const renderComponentAndModal = (isInteractive = true) => {
    const { container } = render(FolloweeTest, {
      props: {
        followee,
        neuron: mockNeuron,
        isInteractive,
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

  describe("when isInteractive is false", () => {
    it("should not render open button", async () => {
      const { componentPo } = renderComponentAndModal(false);
      expect(await componentPo.getButton().isPresent()).toBe(false);
    });

    it("should not render copy button", async () => {
      const po = renderComponent(false);
      expect(await po.getCopyButton().isPresent()).toBe(false);
    });

    it("should render neuronId", async () => {
      const po = renderComponent();
      expect(await po.getName()).toBe(followee.neuronId.toString());
    });

    it("should render topics", async () => {
      const po = renderComponent();
      expect(await po.getTags()).toEqual([
        "Exchange Rate",
        "Governance",
        "KYC",
      ]);
    });

    it("should render ids", async () => {
      const id = `followee-${followee.neuronId}`;
      const po = renderComponent();
      expect(await po.getId()).toBe(id);
      expect(await po.getAriaLabeledBy()).toBe(id);
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
  });
});
