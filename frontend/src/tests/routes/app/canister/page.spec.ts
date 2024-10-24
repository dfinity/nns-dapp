import CanisterPage from "$routes/(app)/(nns)/canister/+page.svelte";
import { setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Canister page", () => {
  beforeEach(() => {
    setNoIdentity();
  });

  it("should render sign-in if not logged in", () => {
    const { getByTestId } = render(CanisterPage, {
      props: {
        data: {
          canister: "test",
        },
      },
    });

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
