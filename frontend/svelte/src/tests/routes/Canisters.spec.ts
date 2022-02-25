/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import Canisters from "../../routes/Canisters.svelte";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../mocks/auth.store.mock";

describe("Canisters", () => {
  let authStoreMock;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render content", () => {
    const { getByText } = render(Canisters);

    expect(
      getByText(
        "Canisters are computational units (a form of smart contracts)",
        {
          exact: false,
        }
      )
    ).toBeInTheDocument();
  });

  it("should subscribe to store", () =>
    expect(authStoreMock).toHaveBeenCalled());

  it("should render a principal as text", () => {
    const { getByText } = render(Canisters);

    expect(
      getByText(mockPrincipal.toText(), { exact: false })
    ).toBeInTheDocument();
  });
});
