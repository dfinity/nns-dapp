import ExportNeuronsButton from "$lib/components/header/ExportNeuronsButton.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { generateCsvFileToSave } from "$lib/utils/export-to-csv.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent, render, screen } from "@testing-library/svelte";

describe("ExportNeuronsButton", () => {
  beforeEach(() => {
    vi.mock("$lib/utils/export-to-csv.utils", () => ({
      generateCsvFileToSave: vi.fn(),
    }));
    vi.spyOn(toastsStore, "toastsError");
    neuronsStore.setNeurons({ neurons: [mockNeuron], certified: true });
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

  it("should transform neuron data correctly", async () => {
    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    await fireEvent.click(button);

    expect(generateCsvFileToSave).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            neuronId: "1",
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

    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should show error toast when file system access fails", async () => {
    // generateCsvFileToSave.mockRejectedValueOnce(new FileSystemAccessError());

    render(ExportNeuronsButton);
    const button = screen.getByRole("button");
    await fireEvent.click(button);

    expect(toastsError).toHaveBeenCalledWith({
      labelKey: "export_error.file_system_access",
    });
  });
});
