import { goto } from "$app/navigation";
import { AppPath } from "$lib/constants/routes.constants";
import AddressBookPage from "$routes/(app)/(nns)/address-book/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

vi.mock("$app/navigation", () => ({
  goto: vi.fn(() => Promise.resolve()),
}));

describe("Address Book page", () => {
  describe("not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should redirect to homepage if not logged in", () => {
      render(AddressBookPage);

      expect(goto).toHaveBeenCalledWith(AppPath.Portfolio);
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should render address book page", () => {
      const { container } = render(AddressBookPage);

      expect(container.querySelector("main")).toBeInTheDocument();
    });
  });
});
