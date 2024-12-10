import ReportingPage from "$lib/routes/Reporting.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ReportingPagePo } from "$tests/page-objects/ReportingPage.page-object";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Reporting", () => {
  beforeEach(() => {
    resetIdentity();
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
});
