/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import type { CanisterDetails } from "../../lib/canisters/ic-management/ic-management.canister.types";
import { UserNotTheControllerError } from "../../lib/canisters/ic-management/ic-management.errors";
import {
  getCanisterDetails,
  listCanisters,
} from "../../lib/services/canisters.services";
import { canistersStore } from "../../lib/stores/canisters.store";
import { routeStore } from "../../lib/stores/route.store";
import CanisterDetail from "../../routes/CanisterDetail.svelte";
import { mockCanister, mockCanisterDetails } from "../mocks/canisters.mock";
import { mockRouteStoreSubscribe } from "../mocks/route.store.mock";

const defaultReturn = Promise.resolve(mockCanisterDetails);
let getCanisterDetailsReturn = defaultReturn;
const setGetCanisterDetailReturn = (value: Promise<CanisterDetails>) =>
  (getCanisterDetailsReturn = value);
const resetGetCanisterDetailReturn = () =>
  (getCanisterDetailsReturn = defaultReturn);
jest.mock("../../lib/services/canisters.services", () => {
  return {
    listCanisters: jest.fn(),
    routePathCanisterId: () => mockCanister.canister_id.toText(),
    getCanisterDetails: jest
      .fn()
      .mockImplementation(() => getCanisterDetailsReturn),
    getCanisterFromStore: () => mockCanister,
  };
});

describe("CanisterDetail", () => {
  jest
    .spyOn(routeStore, "subscribe")
    .mockImplementation(
      mockRouteStoreSubscribe(
        `/#/canister/${mockCanister.canister_id.toText()}`
      )
    );

  afterEach(() => {
    jest.clearAllMocks();
    canistersStore.setCanisters({ canisters: undefined, certified: true });
  });

  it("should render title once loaded", async () => {
    canistersStore.setCanisters({ canisters: [mockCanister], certified: true });
    const { container } = render(CanisterDetail);

    const title = container.querySelector("h1");

    await waitFor(() => expect(title).not.toBeNull());
    expect((title as HTMLElement).textContent).toEqual(
      mockCanister.canister_id.toText()
    );
  });

  it("should fetch canisters from nns-dapp if store is not loaded yet", async () => {
    render(CanisterDetail);
    await waitFor(() => expect(listCanisters).toBeCalled());
  });

  it("should get canister details", async () => {
    canistersStore.setCanisters({ canisters: [mockCanister], certified: true });
    render(CanisterDetail);
    await waitFor(() => expect(getCanisterDetails).toBeCalled());
  });

  it("should render canister id", async () => {
    // Need to be the same that routePathCanisterId returns.
    canistersStore.setCanisters({ canisters: [mockCanister], certified: true });
    const { queryAllByText } = render(CanisterDetail);

    await waitFor(() =>
      expect(
        queryAllByText(mockCanister.canister_id.toText()).length
      ).toBeGreaterThan(0)
    );
  });

  it("should render cards", async () => {
    // Need to be the same that routePathCanisterId returns.
    canistersStore.setCanisters({ canisters: [mockCanister], certified: true });
    const { queryByTestId } = render(CanisterDetail);

    await waitFor(() =>
      expect(queryByTestId("canister-cycles-card")).toBeInTheDocument()
    );
    // Waiting for the one above is enough
    expect(queryByTestId("canister-controllers-card")).toBeInTheDocument();
  });

  it("should not render cards if user is not the controller", async () => {
    setGetCanisterDetailReturn(Promise.reject(new UserNotTheControllerError()));
    // Need to be the same that routePathCanisterId returns.
    canistersStore.setCanisters({ canisters: [mockCanister], certified: true });
    const { queryByTestId } = render(CanisterDetail);

    await waitFor(() =>
      expect(queryByTestId("canister-details-error-card")).toBeInTheDocument()
    );
    // Waiting for the one above is enough
    expect(queryByTestId("canister-cycles-card")).not.toBeInTheDocument();
    expect(queryByTestId("canister-controllers-card")).not.toBeInTheDocument();
    resetGetCanisterDetailReturn();
  });
});
