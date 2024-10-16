import NeuronVisibilityRow from "$lib/modals/neurons/NeuronVisibilityRow.svelte";
import type { NeuronVisibilityRowData } from "$lib/types/neuron-visibility-row";
import { NeuronVisibilityRowPo } from "$tests/page-objects/NeuronVisibilityRow.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("NeuronVisibilityRow", () => {
  const renderComponent = ({
    rowData,
    checked = false,
    disabled = false,
  }: {
    rowData: NeuronVisibilityRowData;
    checked?: boolean;
    disabled?: boolean;
  }) => {
    const nnsChangeMock = vi.fn();
    const { container, component } = render(NeuronVisibilityRow, {
      props: { rowData, checked, disabled },
    });

    component.$on("nnsChange", nnsChangeMock);

    const po = NeuronVisibilityRowPo.under({
      element: new JestPageObjectElement(container),
      neuronId: rowData.neuronId.toString(),
    });

    return { po, nnsChangeMock };
  };

  it("should display the correct neuron ID", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent({ rowData });

    expect(await po.getNeuronId()).toBe("123");
  });

  it("should display the public icon for public neurons", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: true,
      tags: [],
    };

    const { po } = renderComponent({ rowData });

    expect(await po.isPublic()).toBe(true);
  });

  it("should not display the public icon for private neurons", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent({ rowData });

    expect(await po.isPublic()).toBe(false);
  });

  it("should display tags when present", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: ["Tag1", "Tag2"],
    };

    const { po } = renderComponent({ rowData });

    expect(await po.getTags()).toEqual(["Tag1", "Tag2"]);
  });

  it("should not display tags when not present", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent({ rowData });

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

    const { po } = renderComponent({ rowData });

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
        text: "1231392...2831823",
      },
    };

    const { po } = renderComponent({ rowData });

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

    const { po } = renderComponent({ rowData });

    expect(await po.getUncontrolledNeuronDetailsText()).toBeNull();
  });

  it("should display public icon tooltip", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: true,
      tags: [],
    };

    const { po } = renderComponent({ rowData });

    const tooltipPo = await po.getPublicNeuronTooltipPo();
    expect(await tooltipPo.getTooltipText()).toBe("Neuron is public");
  });

  it("should display multiple tags when present", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: ["First tag", "Second tag"],
    };

    const { po } = renderComponent({ rowData });

    const tags = await po.getTags();
    expect(tags).toEqual(["First tag", "Second tag"]);
    expect(tags).toHaveLength(2);
  });

  it("should render checkbox in unchecked state by default", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent({ rowData });

    expect(await po.getCheckboxPo().isChecked()).toBe(false);
  });

  it("should render checkbox in checked state when checked prop is true", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent({ rowData, checked: true });

    expect(await po.getCheckboxPo().isChecked()).toBe(true);
  });

  it("should emit nnsChange event when checkbox is clicked", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po, nnsChangeMock } = renderComponent({ rowData });

    expect(nnsChangeMock).not.toHaveBeenCalled();

    await po.getCheckboxPo().click();

    expect(nnsChangeMock).toHaveBeenCalled();
  });

  it("should render checkbox in disabled state when disabled prop is true", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po } = renderComponent({ rowData, checked: false, disabled: true });

    const checkboxPo = po.getCheckboxPo();
    checkboxPo.click();

    expect(await checkboxPo.isDisabled()).toBe(true);
  });

  it("should not emit nnsChange event when disabled checkbox is clicked", async () => {
    const rowData: NeuronVisibilityRowData = {
      neuronId: BigInt(123).toString(),
      isPublic: false,
      tags: [],
    };

    const { po, nnsChangeMock } = renderComponent({
      rowData,
      checked: false,
      disabled: true,
    });

    const checkboxPo = po.getCheckboxPo();
    await checkboxPo.click();

    expect(nnsChangeMock).not.toHaveBeenCalled();
  });
});
