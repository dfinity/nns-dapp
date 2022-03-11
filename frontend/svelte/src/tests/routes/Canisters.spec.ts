/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../lib/canisters/nns-dapp/nns-dapp.canister";
import { authStore } from "../../lib/stores/auth.store";
import Canisters from "../../routes/Canisters.svelte";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../mocks/auth.store.mock";

describe("Canisters", () => {
  let authStoreMock: jest.SpyInstance;

  const mockNNSDappCanister: NNSDappCanister = mock<NNSDappCanister>();
  mockNNSDappCanister.getCanisters = jest.fn().mockResolvedValue([]);

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);
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
