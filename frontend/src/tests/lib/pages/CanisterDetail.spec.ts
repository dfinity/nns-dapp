import * as canisterApi from "$lib/api/canisters.api";
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import CanisterDetail from "$lib/pages/CanisterDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { canistersStore } from "$lib/stores/canisters.store";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCanister,
  mockCanisterDetails,
  mockCanisterId,
} from "$tests/mocks/canisters.mock";
import { CanisterDetailPo } from "$tests/page-objects/CanisterDetail.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

vi.mock("$lib/api/canisters.api");

describe("CanisterDetail", () => {
  blockAllCallsTo(["$lib/api/canisters.api"]);

  beforeEach(() => {
    vi.clearAllMocks();
    authStore.setForTesting(mockIdentity);
    canistersStore.setCanisters({ canisters: undefined, certified: true });
  });

  const canisterId = mockCanisterId;

  const props = {
    canisterId: canisterId.toText(),
  };

  describe("canister without name", () => {
    beforeEach(() => {
      vi
        .spyOn(canisterApi, "queryCanisterDetails")
        .mockResolvedValue(mockCanisterDetails);
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
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

    it("should render rename button", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await runResolvedPromises();

      expect(
        queryByTestId("rename-canister-button-component")
      ).toBeInTheDocument();
    });

    it("should render cards", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await runResolvedPromises();

      expect(queryByTestId("canister-controllers-card")).toBeInTheDocument();
    });
  });

  describe("canister with name", () => {
    const canisterName = "canister name";

    beforeEach(() => {
      vi
        .spyOn(canisterApi, "queryCanisterDetails")
        .mockResolvedValue(mockCanisterDetails);
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
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
      vi
        .spyOn(canisterApi, "queryCanisterDetails")
        .mockRejectedValue(new UserNotTheControllerError());
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: "",
        },
      ]);
    });

    it("should not render cards if user is not the controller", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await runResolvedPromises();

      // Waiting for the one above is enough
      expect(queryByTestId("canister-cycles-card")).not.toBeInTheDocument();
      expect(
        queryByTestId("canister-controllers-card")
      ).not.toBeInTheDocument();
    });
  });

  describe("rename button", () => {
    const newName = "new name";
    const oldName = "old name";
    const canisterOldName = {
      canister_id: canisterId,
      name: oldName,
    };
    const canisterNewName = {
      ...canisterOldName,
      name: newName,
    };
    beforeEach(() => {
      vi
        .spyOn(canisterApi, "queryCanisterDetails")
        .mockResolvedValue(mockCanisterDetails);
      vi
        .spyOn(canisterApi, "queryCanisters")
        .mockResolvedValueOnce([canisterOldName])
        .mockResolvedValueOnce([canisterOldName])
        .mockResolvedValueOnce([canisterNewName])
        .mockResolvedValueOnce([canisterNewName]);
      vi.spyOn(canisterApi, "renameCanister").mockResolvedValue(undefined);
    });

    it("should rename the canister successfully", async () => {
      const { container } = render(CanisterDetail, props);

      const po = CanisterDetailPo.under(new VitestPageObjectElement(container));

      await runResolvedPromises();

      expect(await po.getCanisterTitle()).toBe(oldName);

      await po.clickRename();
      await po.getRenameCanisterModalPo().isPresent();
      await po.renameCanister(newName);

      await runResolvedPromises();

      expect(await po.getCanisterTitle()).toBe(newName);
      expect(canisterApi.renameCanister).toHaveBeenCalledTimes(1);
      expect(canisterApi.renameCanister).toHaveBeenCalledWith({
        canisterId,
        name: newName,
        identity: mockIdentity,
      });
    });
  });
});
