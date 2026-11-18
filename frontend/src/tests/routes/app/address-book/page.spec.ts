import AddressBookPage from "$routes/(app)/(nns)/address-book/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Address Book page", () => {
  describe("not signed in", () => {
    it("should render sign-in if not logged in", () => {
      setNoIdentity();

      const { getByTestId } = render(AddressBookPage);

      expect(getByTestId("login-button")).not.toBeNull();
    });
  });

  describe("signed in", () => {
    it("should render address book page when signed in", () => {
      resetIdentity();

      const { getByTestId } = render(AddressBookPage);

      expect(getByTestId("address-book-content")).not.toBeNull();
    });
  });
});
