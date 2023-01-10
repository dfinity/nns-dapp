/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import NeuronPage from "$routes/(app)/(u)/(list)/neuron/+page.svelte";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";

describe("Neuron page", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  beforeAll(() => {
    authStoreMock.next({
      identity: undefined,
    });
  });

  afterAll(() => jest.clearAllMocks());

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
