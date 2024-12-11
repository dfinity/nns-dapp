import * as gobernanceApi from "$lib/api/governance.api";
import ReportingNeuronsButton from "$lib/components/reporting/ReportingNeuronsButton.svelte";
import { authStore } from "$lib/stores/auth.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { toastsError } from "$lib/stores/toasts.store";
import * as exportToCsv from "$lib/utils/export-to-csv.utils";
import { generateCsvFileToSave } from "$lib/utils/export-to-csv.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ReportingNeuronsButtonPo } from "$tests/page-objects/ReportingNeuronsButon.page-object";
import { render } from "@testing-library/svelte";
vi.mock("$lib/api/governance.api");

describe("ReportingNeuronsButton", () => {
  beforeEach(() => {
    vi.clearAllTimers();

    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockImplementation(vi.fn());
    vi.spyOn(toastsStore, "toastsError");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const mockDate = new Date("2023-10-14T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));
    authStore.setForTesting(mockIdentity);

    const neuronWithController = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "1",
      },
    };

    vi.spyOn(gobernanceApi, "queryNeurons").mockResolvedValue([
      neuronWithController,
    ]);
  });

  const renderComponent = ({ onTrigger }: { onTrigger?: () => void } = {}) => {
    const { container, component } = render(ReportingNeuronsButton);

    const po = ReportingNeuronsButtonPo.under({
      element: new JestPageObjectElement(container),
    });

    if (onTrigger) {
      component.$on("nnsExportNeuronsCsvTriggered", onTrigger);
    }
    return po;
  };

  it("should name the file with the date of the export", async () => {
    const po = renderComponent();

    expect(generateCsvFileToSave).toBeCalledTimes(0);

    await po.click();

    const expectedFileName = `neurons_export_20231014`;
    expect(generateCsvFileToSave).toBeCalledWith(
      expect.objectContaining({
        fileName: expectedFileName,
      })
    );
    expect(generateCsvFileToSave).toBeCalledTimes(1);
  });

  it("should transform neuron data correctly", async () => {
    const po = renderComponent();

    expect(generateCsvFileToSave).toBeCalledTimes(0);
    await po.click();
    expect(generateCsvFileToSave).toBeCalledWith(
      expect.objectContaining({
        datasets: expect.arrayContaining([
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                neuronId: "1",
                project: "Internet Computer",
                symbol: "ICP",
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
          }),
        ]),
      })
    );
    expect(generateCsvFileToSave).toBeCalledTimes(1);
  });

  it("should show error toast when file system access fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.FileSystemAccessError("File system access denied")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);
    await po.click();
    expect(toastsError).toBeCalledWith({
      labelKey: "export_error.file_system_access",
    });
    expect(toastsError).toBeCalledTimes(1);
  });

  it("should show error toast when Csv generation fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.CsvGenerationError("Csv generation failed")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);
    await po.click();
    expect(toastsError).toBeCalledWith({
      labelKey: "export_error.csv_generation",
    });
    expect(toastsError).toBeCalledTimes(1);
  });

  it("should show error toast when file saving fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new Error("Something wrong happened")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);
    await po.click();
    expect(toastsError).toBeCalledWith({
      labelKey: "export_error.neurons",
    });
    expect(toastsError).toBeCalledTimes(1);
  });
});
