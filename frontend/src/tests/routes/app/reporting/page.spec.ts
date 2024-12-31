import ReportingPage from "$routes/(app)/(nns)/reporting/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Reporting page", () => {
  it("should render sign-in if not logged in", () => {
    setNoIdentity();

    const { queryByTestId } = render(ReportingPage);
    expect(queryByTestId("login-button")).not.toBeNull();
    expect(queryByTestId("reporting-page")).toBeNull();
  });

  it("should render reporting page if logged in", () => {
    resetIdentity();

    const { queryByTestId } = render(ReportingPage);
    expect(queryByTestId("login-button")).toBeNull();
    expect(queryByTestId("reporting-page")).not.toBeNull();
  });
});
