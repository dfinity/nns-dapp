import ReportingPage from "$routes/(app)/(nns)/reporting/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Reporting page", () => {
  describe("not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should render sign-in if not logged in", () => {
      const { getByTestId } = render(ReportingPage);

      expect(getByTestId("login-button")).not.toBeNull();
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    // TODO: Once the ExportNeurons and ExportTransactions components are migrated to this new page
    it.skip("should render generate neurons report section", () => {});
    it.skip("should render generate transactions report section", () => {});
  });
});
