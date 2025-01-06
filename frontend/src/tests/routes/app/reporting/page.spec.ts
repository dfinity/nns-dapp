import ReportingPage from "$routes/(app)/(nns)/reporting/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { ReportingRoutePo } from "$tests/page-objects/ReportingRoute.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Reporting page", () => {
  const renderComponent = () => {
    const { container } = render(ReportingPage);
    const po = ReportingRoutePo.under(new JestPageObjectElement(container));
    return po;
  };

  it("should render sign-in if not logged in", async () => {
    setNoIdentity();

    const po = renderComponent();

    expect(await po.getLoginButtonPo().isPresent()).toBe(true);
    expect(await po.getReportingPagePo().isPresent()).toBe(false);
  });

  it("should render reporting page if logged in", async () => {
    resetIdentity();

    const po = renderComponent();

    expect(await po.getLoginButtonPo().isPresent()).toBe(false);
    expect(await po.getReportingPagePo().isPresent()).toBe(true);
  });
});
