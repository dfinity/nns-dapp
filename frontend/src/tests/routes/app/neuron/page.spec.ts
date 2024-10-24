import NeuronPage from "$routes/(app)/(u)/(detail)/neuron/+page.svelte";
import { setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Neuron page", () => {
  beforeEach(() => {
    setNoIdentity();
  });

  it("should render sign-in if not logged in", () => {
    const { getByTestId } = render(NeuronPage, {
      props: {
        data: {
          neuron: "test",
        },
      },
    });

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
