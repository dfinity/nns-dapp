/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { listCanisters } from "../../lib/services/canisters.services";
import { authStore } from "../../lib/stores/auth.store";
import { canistersStore } from "../../lib/stores/canisters.store";
import Canisters from "../../routes/Canisters.svelte";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../mocks/auth.store.mock";
import { mockCanistersStoreSubscribe } from "../mocks/canisters.mock";
import en from "../mocks/i18n.mock";

jest.mock("../../lib/services/canisters.services", () => {
  return {
    listCanisters: jest.fn(),
  };
});

describe("Canisters", () => {
  let authStoreMock: jest.SpyInstance;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(canistersStore, "subscribe")
      .mockImplementation(mockCanistersStoreSubscribe);
  });

  it("should render content", () => {
    const { getByText } = render(Canisters);

    expect(getByText(en.canisters.text)).toBeInTheDocument();
    expect(getByText(en.canisters.step1)).toBeInTheDocument();
    expect(getByText(en.canisters.step2)).toBeInTheDocument();
    expect(getByText(en.canisters.step3)).toBeInTheDocument();
  });

  it("should subscribe to store", () =>
    expect(authStoreMock).toHaveBeenCalled());

  it("should load canisters", () => expect(listCanisters).toHaveBeenCalled());

  it("should render a principal as text", () => {
    const { getByText } = render(Canisters);

    expect(
      getByText(mockPrincipal.toText(), { exact: false })
    ).toBeInTheDocument();
  });

  it("should render canister cards for canisters", () => {
    const { queryAllByTestId } = render(Canisters);

    expect(queryAllByTestId("canister-card").length).toBe(2);
  });
});
