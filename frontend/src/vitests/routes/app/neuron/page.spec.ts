import { authStore } from "$lib/stores/auth.store";
import NeuronPage from "$routes/(app)/(u)/(detail)/neuron/+page.svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Neuron page", () => {
  vi.spyOn(authStore, "subscribe").mockImplementation(
    mutableMockAuthStoreSubscribe
  );

  beforeAll(() => {
    authStoreMock.next({
      identity: undefined,
    });
  });

  afterAll(() => vi.clearAllMocks());

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
