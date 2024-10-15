import NeuronVisibilityRow from "$lib/modals/neurons/NeuronVisibilityRow.svelte";
import type { NeuronVisibilityRowData } from "$lib/types/neuron-visibility-row";
import { NeuronVisibilityRowPo } from "$tests/page-objects/NeuronVisibilityRow.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("NeuronVisibilityRow", () => {
  const renderComponent = (rowData: NeuronVisibilityRowData) => {
    const { container } = render(NeuronVisibilityRow, {
      props: { rowData },
    });

    return {
      po: NeuronVisibilityRowPo.under(
        new JestPageObjectElement(container),
        rowData.neuronId.toString()
      ),
    };
  };

  it("should display the correct neuron ID", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent(rowData);

    expect(await po.getNeuronId()).toBe("123");
  });

  it("should display the public icon for public neurons", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: true,
      tags: [],
    };

    const { po } = renderComponent(rowData);

    expect(await po.isPublic()).toBe(true);
  });

  it("should not display the public icon for private neurons", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent(rowData);

    expect(await po.isPublic()).toBe(false);
  });

  it("should display tags when present", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: ["Tag1", "Tag2"],
    };

    const { po } = renderComponent(rowData);

    expect(await po.getTags()).toEqual(["Tag1", "Tag2"]);
  });

  it("should not display tags when not present", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent(rowData);

    expect(await po.getTags()).toEqual([]);
  });

  it("should display uncontrolled neuron details for hardware wallet", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
      uncontrolledNeuronDetails: {
        type: "hardwareWallet",
        text: "Hardware Wallet",
      },
    };

    const { po } = renderComponent(rowData);

    expect(await po.getUncontrolledNeuronDetailsText()).toEqual(
      "Hardware Wallet"
    );
  });

  it("should display uncontrolled neuron details for hotkey", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
      uncontrolledNeuronDetails: {
        type: "hotkey",
        text: "12313921238123812831823",
      },
    };

    const { po } = renderComponent(rowData);

    expect(await po.getUncontrolledNeuronDetailsText()).toEqual(
      "1231392...2831823"
    );
  });

  it("should not display uncontrolled neuron details when not present", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent(rowData);

    expect(await po.getUncontrolledNeuronDetailsText()).toBeNull();
  });

  it("should display public icon tooltip", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: true,
      tags: [],
    };

    const { po } = renderComponent(rowData);

    const tooltipPo = await po.getPublicNeuronTooltipPo();
    expect(await tooltipPo.getTooltipText()).toBe("Neuron is public");
  });

  it("should display multiple tags when present", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: ["First tag", "Second tag"],
    };

    const { po } = renderComponent(rowData);

    const tags = await po.getTags();
    expect(tags).toEqual(["First tag", "Second tag"]);
    expect(tags).toHaveLength(2);
  });
});
