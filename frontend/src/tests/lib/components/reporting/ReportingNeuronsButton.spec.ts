import * as gobernanceApi from "$lib/api/governance.api";
import ReportingNeuronsButton from "$lib/components/reporting/ReportingNeuronsButton.svelte";
import * as toastsStore from "$lib/stores/toasts.store";
import { toastsError } from "$lib/stores/toasts.store";
import {
  CsvGenerationError,
  FileSystemAccessError,
} from "$lib/utils/reporting.save-csv-to-file.utils";
import * as exportToCsvUtils from "$lib/utils/reporting.utils";
import { generateCsvFileToSave } from "$lib/utils/reporting.utils";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ReportingNeuronsButtonPo } from "$tests/page-objects/ReportingNeuronsButon.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { busyStore } from "@dfinity/gix-components";
import type { NeuronInfo } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

vi.mock("$lib/api/governance.api");

describe("ReportingNeuronsButton", () => {
  let spyQueryNeurons;
  let spyBuildNeuronsDatasets;

  beforeEach(() => {
    vi.clearAllTimers();
    resetIdentity();

    vi.spyOn(exportToCsvUtils, "generateCsvFileToSave").mockImplementation(
      vi.fn()
    );
    vi.spyOn(toastsStore, "toastsError");
    vi.spyOn(console, "error").mockImplementation(() => {});
    spyBuildNeuronsDatasets = vi.spyOn(
      exportToCsvUtils,
      "buildNeuronsDatasets"
    );

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

    spyQueryNeurons = vi
      .spyOn(gobernanceApi, "queryNeurons")
      .mockResolvedValue([neuronWithController]);
  });

  const renderComponent = ({ onTrigger }: { onTrigger?: () => void } = {}) => {
    const { container } = render(ReportingNeuronsButton, {
      props: {},
      events: {
        ...(nonNullish(onTrigger) && {
          nnsExportNeuronsCsvTriggered: onTrigger,
        }),
      },
    });

    const po = ReportingNeuronsButtonPo.under({
      element: new JestPageObjectElement(container),
    });

    return po;
  };

  it("should name the file with the date of the export", async () => {
    const po = renderComponent();

    expect(generateCsvFileToSave).toBeCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    const expectedFileName = `neurons_export_20231014`;
    expect(generateCsvFileToSave).toBeCalledWith(
      expect.objectContaining({
        fileName: expectedFileName,
      })
    );
    expect(generateCsvFileToSave).toBeCalledTimes(1);
  });

  it("should fetch neurons and sort them by stake", async () => {
    const mockLowMaturityNeuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 1n,
      },
    };

    const mockHighMaturityNeuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 100n,
      },
    };

    const mockNeurons: NeuronInfo[] = [
      mockLowMaturityNeuron,
      mockHighMaturityNeuron,
    ];

    spyQueryNeurons.mockResolvedValue(mockNeurons);

    const po = renderComponent();

    expect(spyQueryNeurons).toBeCalledTimes(0);
    expect(spyBuildNeuronsDatasets).toBeCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    const expectation = [mockHighMaturityNeuron, mockLowMaturityNeuron];
    expect(spyQueryNeurons).toHaveBeenCalledTimes(1);
    expect(spyBuildNeuronsDatasets).toHaveBeenCalledTimes(1);
    expect(spyBuildNeuronsDatasets).toHaveBeenCalledWith(
      expect.objectContaining({
        neurons: expectation,
      })
    );
  });

  it("should transform neuron data correctly", async () => {
    const po = renderComponent();

    expect(generateCsvFileToSave).toBeCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    expect(generateCsvFileToSave).toBeCalledWith(
      expect.objectContaining({
        datasets: expect.arrayContaining([
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                neuronId: '="1"',
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
    vi.spyOn(exportToCsvUtils, "generateCsvFileToSave").mockRejectedValueOnce(
      new FileSystemAccessError("File system access denied")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    expect(toastsError).toBeCalledWith({
      labelKey: "reporting.error_file_system_access",
    });
    expect(toastsError).toBeCalledTimes(1);
  });

  it("should show error toast when Csv generation fails", async () => {
    vi.spyOn(exportToCsvUtils, "generateCsvFileToSave").mockRejectedValueOnce(
      new CsvGenerationError("Csv generation failed")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    expect(toastsError).toBeCalledWith({
      labelKey: "reporting.error_csv_generation",
    });
    expect(toastsError).toBeCalledTimes(1);
  });

  it("should show error toast when file saving fails", async () => {
    vi.spyOn(exportToCsvUtils, "generateCsvFileToSave").mockRejectedValueOnce(
      new Error("Something wrong happened")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    expect(toastsError).toBeCalledWith({
      labelKey: "reporting.error_neurons",
    });
    expect(toastsError).toBeCalledTimes(1);
  });

  it("should disable the button while exporting", async () => {
    const po = renderComponent();

    expect(await po.isDisabled()).toBe(false);

    await po.click();

    expect(await po.isDisabled()).toBe(true);

    await runResolvedPromises();

    expect(await po.isDisabled()).toBe(false);
  });

  it("should show busy page exporting", async () => {
    const po = renderComponent();
    expect(get(busyStore)).toEqual([]);

    await po.click();

    expect(get(busyStore)).toEqual([
      {
        initiator: "reporting-neurons",
        text: "Generating report... This may take a moment",
      },
    ]);

    await runResolvedPromises();

    expect(get(busyStore)).toEqual([]);
  });
});
