import ExportNeuronsButton from "$lib/components/header/ExportNeuronsButton.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { toastsError } from "$lib/stores/toasts.store";
import * as exportToCsv from "$lib/utils/export-to-csv.utils";
import { generateCsvFileToSave } from "$lib/utils/export-to-csv.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent, render, screen } from "@testing-library/svelte";

describe("ExportNeuronsButton", () => {
  beforeEach(() => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockImplementation(vi.fn());
    vi.spyOn(toastsStore, "toastsError");
    vi.spyOn(console, "error").mockImplementation(() => {});
    
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

  it("should be disabled when there are no neurons", () => {
    neuronsStore.setNeurons({ neurons: [], certified: true });
    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should be enabled when neurons are present", () => {
    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    expect(button).toBeEnabled();
  });

  it("should name the file with the date of the export", async () => {
    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    const expectedFileName = `neurons-export-01/01/1970`;
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
    const { component } = render(ExportNeuronsButton);

    const mockDispatch = vi.fn();
    component.$on("nnsExportNeuronsCSVTriggered", mockDispatch);

    const button = screen.getByRole("button");
    await fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch.mock.calls[0][0].type).toBe(
      "nnsExportNeuronsCSVTriggered"
    );
  });

  it("should show error toast when file system access fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.FileSystemAccessError("File system access denied")
    );

    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(toastsError).toHaveBeenCalledWith({
      labelKey: "export_error.file_system_access",
    });
  });

  it("should show error toast when Csv generation fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.CsvGenerationError("Csv generation failed")
    );

    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(toastsError).toHaveBeenCalledWith({
      labelKey: "export_error.csv_generation",
    });
  });

  it("should show error toast when file saving fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new Error("Something wrong happened")
    );

    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(toastsError).toHaveBeenCalledWith({
      labelKey: "export_error.neurons",
    });
  });
});
