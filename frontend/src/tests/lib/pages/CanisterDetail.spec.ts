import * as canisterApi from "$lib/api/canisters.api";
import * as icpIndexApi from "$lib/api/icp-index.api";
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import CanisterDetail from "$lib/pages/CanisterDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { canistersStore } from "$lib/stores/canisters.store";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCanisterDetails,
  mockCanisterId,
} from "$tests/mocks/canisters.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import { CanisterDetailPo } from "$tests/page-objects/CanisterDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/canisters.api");

describe("CanisterDetail", () => {
  blockAllCallsTo(["$lib/api/canisters.api"]);

  beforeEach(() => {
    authStore.setForTesting(mockIdentity);
    canistersStore.setCanisters({ canisters: undefined, certified: true });
  });

  const canisterId = mockCanisterId;

  const props = {
    canisterId: canisterId.toText(),
  };

  const renderComponent = async (
    canisterIdText: string = canisterId.toText()
  ) => {
    const { container } = render(CanisterDetail, {
      props: { canisterId: canisterIdText },
    });

    const po = CanisterDetailPo.under(new JestPageObjectElement(container));

    await runResolvedPromises();

    return po;
  };

  describe("canister without name", () => {
    beforeEach(() => {
      vi.spyOn(canisterApi, "queryCanisterDetails").mockResolvedValue(
        mockCanisterDetails
      );
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: "",
        },
      ]);
    });

    it("should not render subitle", async () => {
      const po = await renderComponent();
      expect(await po.hasSubtitle()).toBe(false);
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
      vi.spyOn(canisterApi, "queryCanisterDetails").mockResolvedValue(
        mockCanisterDetails
      );
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: canisterName,
        },
      ]);
    });

    it("should render canister name as subtitle", async () => {
      const po = await renderComponent();
      expect(await po.getSubtitle()).toBe(canisterName);
    });

    it("should render canister id", async () => {
      const { queryByTestId } = render(CanisterDetail, props);

      await runResolvedPromises();

      expect(queryByTestId("identifier").textContent.trim()).toEqual(
        shortenWithMiddleEllipsis(canisterId.toText())
      );
    });
  });

  describe("user is the controller", () => {
    beforeEach(() => {
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: "canister name",
        },
      ]);
    });

    it("shuold render cycles balance as title", async () => {
      vi.spyOn(canisterApi, "queryCanisterDetails").mockResolvedValue({
        ...mockCanisterDetails,
        cycles: 1_000_000_000_000n,
      });
      const po = await renderComponent();
      expect(await po.getTitle()).toBe("1.000 T Cycles");
    });
  });

  describe("if user is not the controller", () => {
    beforeEach(() => {
      vi.spyOn(canisterApi, "queryCanisterDetails").mockRejectedValue(
        new UserNotTheControllerError()
      );
    });

    it("should not render controllers card if user is not the controller", async () => {
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: "",
        },
      ]);
      const { queryByTestId } = render(CanisterDetail, props);

      await runResolvedPromises();

      expect(
        queryByTestId("canister-controllers-card")
      ).not.toBeInTheDocument();
    });

    it("should render canister id as title if canister has no name", async () => {
      const canisterIdText = "ryjl3-tyaaa-aaaaa-aaaba-cai";
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: Principal.fromText(canisterIdText),
          name: "",
        },
      ]);
      const po = await renderComponent();
      expect(await po.getTitle()).toBe(canisterIdText);
    });

    it("should render canister id as title", async () => {
      const canisterName = "canister name";
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: canisterName,
        },
      ]);
      const po = await renderComponent();
      expect(await po.getTitle()).toBe(canisterName);
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
      vi.spyOn(canisterApi, "queryCanisterDetails").mockResolvedValue(
        mockCanisterDetails
      );
      vi.spyOn(canisterApi, "queryCanisters")
        .mockResolvedValueOnce([canisterOldName])
        .mockResolvedValueOnce([canisterOldName])
        .mockResolvedValueOnce([canisterNewName])
        .mockResolvedValueOnce([canisterNewName]);
      vi.spyOn(canisterApi, "renameCanister").mockResolvedValue(undefined);
    });

    it("should rename the canister successfully", async () => {
      const { container } = render(CanisterDetail, props);

      const po = CanisterDetailPo.under(new JestPageObjectElement(container));

      await runResolvedPromises();

      expect(await po.getSubtitle()).toBe(oldName);

      await po.clickRename();
      await po.getRenameCanisterModalPo().isPresent();
      await po.renameCanister(newName);

      await runResolvedPromises();

      expect(await po.getSubtitle()).toBe(newName);
      expect(canisterApi.renameCanister).toHaveBeenCalledTimes(1);
      expect(canisterApi.renameCanister).toHaveBeenCalledWith({
        canisterId,
        name: newName,
        identity: mockIdentity,
      });
    });
  });

  describe("notifyTopUpIfNeeded", () => {
    const blockHeight = 34n;
    const topUpMemo = 0x50555054n; // TPUP
    const topUpTransaction = createTransactionWithId({
      id: blockHeight,
      memo: topUpMemo,
    });

    beforeEach(() => {
      vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue([
        {
          canister_id: canisterId,
          name: "",
        },
      ]);
    });

    it("should reload the canister after the CMC is notified", async () => {
      const initialCycles = 1_000_000_000_000n;
      const cyclesAfterTopUp = 3_000_000_000_000n;

      const mockCanisterDetailsBeforeNotify = {
        ...mockCanisterDetails,
        cycles: initialCycles,
      };
      const mockCanisterDetailsAfterNotify = {
        ...mockCanisterDetails,
        cycles: cyclesAfterTopUp,
      };
      let canisterDetails = mockCanisterDetailsBeforeNotify;

      vi.spyOn(canisterApi, "queryCanisterDetails").mockImplementation(
        async () => {
          return canisterDetails;
        }
      );

      vi.spyOn(icpIndexApi, "getTransactions").mockResolvedValue({
        balance: 100_000_000n,
        transactions: [topUpTransaction],
      });
      let resolveNotifyTopUpCanister: () => void;

      vi.spyOn(canisterApi, "notifyTopUpCanister").mockImplementation(
        async () => {
          return new Promise((resolve) => {
            resolveNotifyTopUpCanister = () => {
              canisterDetails = mockCanisterDetailsAfterNotify;
              resolve(cyclesAfterTopUp - initialCycles);
            };
          });
        }
      );

      const po = await renderComponent();

      expect(await po.getTitle()).toBe("1.000 T Cycles");

      expect(canisterApi.notifyTopUpCanister).toBeCalledTimes(1);

      resolveNotifyTopUpCanister();
      await runResolvedPromises();

      expect(await po.getTitle()).toBe("3.000 T Cycles");
    });

    it("should not reload the canister if the CMC is not notified because the balance is 0", async () => {
      vi.spyOn(canisterApi, "queryCanisterDetails").mockImplementation(
        async () => {
          return mockCanisterDetails;
        }
      );

      vi.spyOn(icpIndexApi, "getTransactions").mockResolvedValue({
        balance: 0n,
        transactions: [],
      });

      vi.spyOn(canisterApi, "notifyTopUpCanister").mockResolvedValue(
        3_000_000_000_000n
      );

      await renderComponent();

      expect(canisterApi.notifyTopUpCanister).toBeCalledTimes(0);
    });

    it("should only check once per render if notifying is needed", async () => {
      vi.spyOn(canisterApi, "queryCanisterDetails").mockImplementation(
        async () => {
          return mockCanisterDetails;
        }
      );
      vi.spyOn(icpIndexApi, "getTransactions").mockResolvedValue({
        balance: 0n,
        transactions: [],
      });

      await renderComponent();

      expect(icpIndexApi.getTransactions).toBeCalledTimes(1);
    });
  });
});
