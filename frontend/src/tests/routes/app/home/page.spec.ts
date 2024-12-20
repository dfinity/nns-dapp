import CanistersPage from "$routes/(app)/(nns)/canisters/+page.svelte";
import { setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Canisters page", () => {
  beforeEach(() => {
    setNoIdentity();
  });

  it("should render sign-in if not logged in", () => {
    const { getByTestId } = render(CanistersPage);

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
