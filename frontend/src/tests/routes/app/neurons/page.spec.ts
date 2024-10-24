import NeuronsPage from "$routes/(app)/(u)/(list)/neurons/+page.svelte";
import { setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Neurons page", () => {
  beforeEach(() => {
    setNoIdentity();
  });

  it("should render sign-in if not logged in", () => {
    const { getByTestId } = render(NeuronsPage);

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
