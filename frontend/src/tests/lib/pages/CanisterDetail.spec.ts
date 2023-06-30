/**
 * @jest-environment jsdom
 */

import * as canisterApi from "$lib/api/canisters.api";
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import CanisterDetail from "$lib/pages/CanisterDetail.svelte";
import { canistersStore } from "$lib/stores/canisters.store";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import {
  mockCanister,
  mockCanisterDetails,
  mockCanisterId,
} from "$tests/mocks/canisters.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/api/canisters.api");

describe("CanisterDetail", () => {
  blockAllCallsTo(["$lib/api/canisters.api"]);

  beforeEach(() => {
    jest.clearAllMocks();
    canistersStore.setCanisters({ canisters: undefined, certified: true });
  });

  const canisterId = mockCanisterId;

  const props = {
    canisterId: canisterId.toText(),
  };

  describe("canister without name", () => {
    beforeEach(() => {
      jest
        .spyOn(canisterApi, "queryCanisterDetails")
        .mockResolvedValue(mockCanisterDetails);
      jest.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: "",
        },
      ]);
    });

    it("should render canister id as title once loaded", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await runResolvedPromises();

      expect(
        queryByTestId("canister-card-title-compoment").textContent.trim()
      ).toEqual(mockCanister.canister_id.toText());
    });

    it("should render cards", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await waitFor(() =>
        expect(queryByTestId("canister-cycles-card")).toBeInTheDocument()
      );
      // Waiting for the one above is enough
      expect(queryByTestId("canister-controllers-card")).toBeInTheDocument();
    });
  });

  describe("canister with name", () => {
    const canisterName = "canister name";

    beforeEach(() => {
      jest
        .spyOn(canisterApi, "queryCanisterDetails")
        .mockResolvedValue(mockCanisterDetails);
      jest.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: canisterName,
        },
      ]);
    });

    it("should render canister name as title", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await runResolvedPromises();

      expect(
        queryByTestId("canister-card-title-compoment").textContent.trim()
      ).toEqual(canisterName);
    });

    it("should render canister id", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await runResolvedPromises();

      expect(queryByTestId("identifier").textContent.trim()).toEqual(
        shortenWithMiddleEllipsis(canisterId.toText())
      );
    });
  });

  describe("if user is not the controller", () => {
    beforeEach(() => {
      jest
        .spyOn(canisterApi, "queryCanisterDetails")
        .mockRejectedValue(new UserNotTheControllerError());
      jest.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: "",
        },
      ]);
    });

    it("should not render cards if user is not the controller", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await waitFor(() =>
        expect(queryByTestId("canister-details-error-card")).toBeInTheDocument()
      );
      // Waiting for the one above is enough
      expect(queryByTestId("canister-cycles-card")).not.toBeInTheDocument();
      expect(
        queryByTestId("canister-controllers-card")
      ).not.toBeInTheDocument();
    });
  });

  // TODO: Add tests that renames the canister
});
