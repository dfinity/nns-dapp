import * as gobernanceApi from "$lib/api/governance.api";
import ReportingPage from "$lib/routes/Reporting.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ReportingPagePo } from "$tests/page-objects/ReportingPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/governance.api");

describe("Reporting", () => {
  const mockNeurons = [mockNeuron];
  let spyQueryNeurons;
  let spyToastError;

  beforeEach(() => {
    resetIdentity();

    spyToastError = vi.spyOn(toastsStore, "toastsError");
    spyQueryNeurons = vi
      .spyOn(gobernanceApi, "queryNeurons")
      .mockResolvedValue(mockNeurons);

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  const renderComponent = () => {
    const { container } = render(ReportingPage);
    const po = ReportingPagePo.under({
      element: new JestPageObjectElement(container),
    });
    return po;
  };

  it("should set title", async () => {
    const titleBefore = get(layoutTitleStore);
    expect(titleBefore).toEqual({ title: "" });

    renderComponent();
    await (() =>
      expect(get(layoutTitleStore)).toEqual({
        title: en.navigation.reporting,
      }));
  });

  it("should reload neurons when identity changes", async () => {
    // Wait for initial load
    renderComponent();
    await runResolvedPromises();

    expect(spyQueryNeurons).toHaveBeenCalledTimes(1);
  });

  it("should show a toast error if queryNeurons fails", async () => {
    spyQueryNeurons.mockRejectedValueOnce(new Error("Error"));

    // Wait for initial load
    renderComponent();
    await runResolvedPromises();

    expect(spyQueryNeurons).toHaveBeenCalledTimes(1);
    expect(spyToastError).toHaveBeenCalledTimes(1);
  });
});
