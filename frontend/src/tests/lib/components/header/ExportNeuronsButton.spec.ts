import ExportNeuronsButton from "$lib/components/header/ExportNeuronsButton.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { toastsError } from "$lib/stores/toasts.store";
import * as exportToCsv from "$lib/utils/export-to-csv.utils";
import { generateCsvFileToSave } from "$lib/utils/export-to-csv.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ExportNeuronsButtonPo } from "$tests/page-objects/ExportNeuronsButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { fireEvent, render, screen } from "@testing-library/svelte";

describe("ExportNeuronsButton", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockImplementation(vi.fn());
    vi.spyOn(toastsStore, "toastsError");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const mockDate = new Date("2023-10-14T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));

    const neuronWithController = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "1",
      },
    };
    neuronsStore.setNeurons({
      neurons: [neuronWithController],
      certified: true,
    });
  });

  const renderComponent = () => {
    const { container, component } = render(ExportNeuronsButton);

    const po = ExportNeuronsButtonPo.under({
      element: new JestPageObjectElement(container),
    });
    return { po, component };
  };

  it("should be disabled when there are no neurons", async () => {
    neuronsStore.setNeurons({ neurons: [], certified: true });
    const { po } = renderComponent();
    expect(await po.isDisabled()).toBe(true);
  });

  it("should be enabled when neurons are present", async () => {
    const { po } = renderComponent();
    expect(await po.isDisabled()).toBe(false);
  });

  it("should name the file with the date of the export", async () => {
    const { po } = renderComponent();
    await po.click();
    const expectedFileName = `neurons_export_20231014`;
    expect(generateCsvFileToSave).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: expectedFileName,
      })
    );
  });

  it("should transform neuron data correctly", async () => {
    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    await fireEvent.click(button);

    expect(generateCsvFileToSave).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            neuronId: "1",
            neuronAccountId:
              "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
            controllerId: "1",
            creationDate: "Jan 1, 1970",
            dissolveDate: "N/A",
            dissolveDelaySeconds: "3 hours, 5 minutes",
            stakedMaturity: "0",
            stake: "30.00",
            state: "Locked",
          }),
        ]),
      })
    );
  });

  it("should dispatch event after export", async () => {
    const { po, component } = renderComponent();

    const mockDispatch = vi.fn();
    component.$on("nnsExportNeuronsCSVTriggered", mockDispatch);

    await po.click();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch.mock.calls[0][0].type).toBe(
      "nnsExportNeuronsCSVTriggered"
    );
  });

  it("should show error toast when file system access fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.FileSystemAccessError("File system access denied")
    );

    const { po } = renderComponent();
    await po.click();
    expect(toastsError).toHaveBeenCalledWith({
      labelKey: "export_error.file_system_access",
    });
  });

  it("should show error toast when Csv generation fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.CsvGenerationError("Csv generation failed")
    );

    const { po } = renderComponent();
    await po.click();
    expect(toastsError).toHaveBeenCalledWith({
      labelKey: "export_error.csv_generation",
    });
  });

  it("should show error toast when file saving fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new Error("Something wrong happened")
    );

    const { po } = renderComponent();
    await po.click();
    expect(toastsError).toHaveBeenCalledWith({
      labelKey: "export_error.neurons",
    });
  });
});
