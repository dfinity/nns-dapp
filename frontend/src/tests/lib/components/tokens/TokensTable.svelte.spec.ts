import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { ActionType } from "$lib/types/actions";
import type { TokensTableOrder } from "$lib/types/tokens-page";
import {
  UserTokenAction,
  type UserTokenData,
  type UserTokenLoading,
} from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import TokensTableTest from "$tests/lib/components/tokens/TokensTableTest.svelte";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createUserToken,
  createUserTokenLoading,
} from "$tests/mocks/tokens-page.mock";
import { TokensTablePo } from "$tests/page-objects/TokensTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { createActionEvent } from "$tests/utils/actions.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get, writable, type Writable } from "svelte/store";
import type { Mock } from "vitest";

describe("TokensTable", () => {
  const renderTable = ({
    userTokensData,
    firstColumnHeader,
    onAction,
    orderStore,
    order,
  }: {
    userTokensData: Array<UserTokenData | UserTokenLoading>;
    firstColumnHeader?: string;
    onAction?: Mock;
    orderStore?: Writable<TokensTableOrder>;
    order?: TokensTableOrder;
  }) => {
    const testProps = $state({
      userTokensData,
      firstColumnHeader,
      order: order ?? get(orderStore),
    });

    const { container } = render(TokensTable, {
      props: testProps,
      events: {
        nnsAction: onAction,
      },
    });

    if (orderStore) {
      $effect.root(() => {
        $effect(() => {
          orderStore.set(testProps.order);
        });
      });
    }

    orderStore?.subscribe((order) => {
      testProps.order = order;
    });

    return TokensTablePo.under(new JestPageObjectElement(container));
  };

  it("should render a row per token", async () => {
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const token2 = createUserToken({
      universeId: principal(0),
    });
    const po = renderTable({ userTokensData: [token1, token2] });

    expect(await po.getRows()).toHaveLength(2);
  });

  it("should render the first column headers from props", async () => {
    const firstColumnHeader = "Accounts";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const po = renderTable({ userTokensData: [token1], firstColumnHeader });

    expect(await po.getFirstColumnHeader()).toEqual(firstColumnHeader);
  });

  it("should render desktop headers", async () => {
    const firstColumnHeader = "Accounts";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const po = renderTable({ userTokensData: [token1], firstColumnHeader });
    expect(await po.getDesktopColumnHeaders()).toEqual([
      "Accounts",
      "Balance",
      "", // No header for actions column.
    ]);
  });

  it("should render mobile headers", async () => {
    const firstColumnHeader = "Accounts";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const po = renderTable({ userTokensData: [token1], firstColumnHeader });
    expect(await po.getMobileColumnHeaders()).toEqual([
      "Accounts",
      "", // No header for actions column.
    ]);
  });

  it("should render cell alignment classes", async () => {
    const firstColumnHeader = "Accounts";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const po = renderTable({ userTokensData: [token1], firstColumnHeader });
    const rows = await po.getRows();
    expect(await rows[0].getCellClasses()).toEqual([
      expect.arrayContaining(["desktop-align-left"]), // Accounts
      expect.arrayContaining(["desktop-align-right"]), // Balance
      expect.arrayContaining(["desktop-align-right"]), // Actions
    ]);
  });

  it("should use correct template columns", async () => {
    const firstColumnHeader = "Accounts";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const po = renderTable({ userTokensData: [token1], firstColumnHeader });

    expect(await po.getDesktopGridTemplateColumns()).toBe(
      "1fr max-content max-content"
    );
    expect(await po.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-0 cell-0"'
    );
  });

  it("should render the last-row slot", async () => {
    const lastRowText = "Add Account";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const { container } = render(TokensTableTest, {
      props: { userTokensData: [token1], lastRowText },
    });

    const po = TokensTablePo.under(new JestPageObjectElement(container));

    expect(await po.getLastRowText()).toEqual(lastRowText);
  });

  it("should render the balances of the tokens", async () => {
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
    });
    const token2 = createUserToken({
      universeId: principal(0),
      balance: TokenAmount.fromE8s({
        amount: 114000000n,
        token: { name: "Tetris", symbol: "TETRIS", decimals: 8 },
      }),
    });
    const po = renderTable({ userTokensData: [token1, token2] });

    const rows = await po.getRows();
    const row1Po = rows[0];
    const row2Po = rows[1];

    expect(await row1Po.getBalance()).toBe("3.14 ICP");
    expect(await row2Po.getBalance()).toBe("1.14 TETRIS");
  });

  it("should not render balance in USD with feature flag disabled", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES", false);
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balanceInUsd: 5,
    });
    const po = renderTable({ userTokensData: [token1] });

    const rows = await po.getRows();
    const rowPo = rows[0];

    expect(await rowPo.hasBalanceInUsd()).toBe(false);
  });

  it("should render unavailable USD balance", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES", true);
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const po = renderTable({ userTokensData: [token1] });

    const rows = await po.getRows();
    const rowPo = rows[0];

    expect(await rowPo.getBalanceInUsd()).toBe("$-/-");
  });

  it("should render balance in USD", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES", true);
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balanceInUsd: 5.678,
    });
    const po = renderTable({ userTokensData: [token1] });

    const rows = await po.getRows();
    const rowPo = rows[0];

    expect(await rowPo.getBalanceInUsd()).toBe("$5.68");
  });

  it("should render the subtitle if present", async () => {
    const subtitle = "Ledger Device";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
      subtitle,
    });
    const token2 = createUserToken({
      universeId: principal(0),
      balance: TokenAmount.fromE8s({
        amount: 114000000n,
        token: { name: "Tetris", symbol: "TETRIS", decimals: 8 },
      }),
    });
    const po = renderTable({ userTokensData: [token1, token2] });

    const rows = await po.getRows();
    const row1Po = rows[0];
    const row2Po = rows[1];

    expect(await row1Po.getSubtitle()).toBe(subtitle);
    expect(await row2Po.getSubtitle()).toBeNull();
  });

  it("should render href link", async () => {
    const href = "/accounts";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
      rowHref: href,
      domKey: href,
    });
    const po = renderTable({ userTokensData: [token1] });

    const rows = await po.getRows();
    const row1Po = rows[0];

    expect(await row1Po.getHref()).toBe(href);
  });

  it("should render specific text if balance not available", async () => {
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balance: new UnavailableTokenAmount({
        name: "ckBTC",
        symbol: "ckBTC",
        decimals: 8,
      }),
    });
    const po = renderTable({ userTokensData: [token1] });

    const rows = await po.getRows();
    const row1Po = rows[0];

    expect(await row1Po.getBalance()).toBe("-/- ckBTC");
  });

  it("should render balance spinner if balance is loading", async () => {
    const token1 = createUserTokenLoading();
    const po = renderTable({ userTokensData: [token1] });

    const rows = await po.getRows();
    const row1Po = rows[0];

    expect(await row1Po.getBalance()).toBe("");
    expect(await row1Po.hasBalanceSpinner()).toBe(true);
  });

  it("should render a button Send action", async () => {
    const po = renderTable({
      userTokensData: [
        createUserToken({
          actions: [UserTokenAction.Send],
        }),
      ],
    });

    const rows = await po.getRows();
    const rowPo = rows[0];

    expect(await rowPo.hasGoToDetailIcon()).toBe(false);
    expect(await rowPo.hasReceiveButton()).toBe(false);
    expect(await rowPo.hasSendButton()).toBe(true);
  });

  it("should render a button Receive action", async () => {
    const po = renderTable({
      userTokensData: [
        createUserToken({
          actions: [UserTokenAction.Receive],
        }),
      ],
    });

    const rows = await po.getRows();
    const rowPo = rows[0];

    expect(await rowPo.hasGoToDetailIcon()).toBe(false);
    expect(await rowPo.hasReceiveButton()).toBe(true);
    expect(await rowPo.hasSendButton()).toBe(false);
  });

  it("should render a button GoToDetail action", async () => {
    const po = renderTable({
      userTokensData: [
        createUserToken({
          actions: [UserTokenAction.GoToDetail],
        }),
      ],
    });

    const rows = await po.getRows();
    const rowPo = rows[0];

    expect(await rowPo.hasGoToDetailIcon()).toBe(true);
    expect(await rowPo.hasReceiveButton()).toBe(false);
    expect(await rowPo.hasSendButton()).toBe(false);
  });

  it("should trigger event when clicking in Send action", async () => {
    const handleAction = vi.fn();
    const userToken = createUserToken({
      actions: [UserTokenAction.Send],
    });
    const po = renderTable({
      userTokensData: [userToken],
      onAction: handleAction,
    });

    expect(handleAction).not.toHaveBeenCalled();
    const rows = await po.getRows();
    await rows[0].clickSend();

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(handleAction).toHaveBeenCalledWith(
      createActionEvent({
        type: ActionType.Send,
        data: userToken,
      })
    );
  });

  it("clicking in a Send action should not trigger the row link", async () => {
    const userToken = createUserToken({
      actions: [UserTokenAction.Send],
      rowHref: AppPath.Neurons,
      domKey: AppPath.Neurons,
    });

    const po = renderTable({
      userTokensData: [userToken],
      onAction: vi.fn(),
    });

    const rows = await po.getRows();
    const rowPo = rows[0];

    const sendButton = rowPo.getSendButton();

    let isClicked = false;
    sendButton.addEventListener("click", (event) => {
      expect(event.defaultPrevented).toBe(true);
      isClicked = true;
    });

    await sendButton.click();

    await waitFor(() => expect(isClicked).toBe(true));
  });

  it("clicking in a Receive action should not trigger the row link", async () => {
    const userToken = createUserToken({
      actions: [UserTokenAction.Receive],
      rowHref: AppPath.Neurons,
      domKey: AppPath.Neurons,
    });

    const po = renderTable({
      userTokensData: [userToken],
      onAction: vi.fn(),
    });

    const rows = await po.getRows();
    const rowPo = rows[0];

    const receiveButton = rowPo.getReceiveButton();

    let isClicked = false;
    receiveButton.addEventListener("click", (event) => {
      expect(event.defaultPrevented).toBe(true);
      isClicked = true;
    });

    await receiveButton.click();

    await waitFor(() => expect(isClicked).toBe(true));
  });

  it("should trigger event when clicking in Receive action", async () => {
    const handleAction = vi.fn();
    const userToken = createUserToken({
      actions: [UserTokenAction.Receive],
    });
    const po = renderTable({
      userTokensData: [userToken],
      onAction: handleAction,
    });

    expect(handleAction).not.toHaveBeenCalled();
    const rows = await po.getRows();
    await rows[0].clickReceive();

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(handleAction).toHaveBeenCalledWith(
      createActionEvent({
        type: ActionType.Receive,
        data: userToken,
      })
    );
  });

  it("should render an imported token tag", async () => {
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const importedTokenLedgerId = principal(0);
    const token2 = createUserToken({
      universeId: importedTokenLedgerId,
    });

    importedTokensStore.set({
      importedTokens: [
        {
          ledgerCanisterId: importedTokenLedgerId,
          indexCanisterId: undefined,
        },
      ],
      certified: true,
    });

    const po = renderTable({ userTokensData: [token1, token2] });
    const rows = await po.getRows();
    const row1Po = rows[0];
    const row2Po = rows[1];

    expect(await row1Po.hasImportedTokenTag()).toBe(false);
    expect(await row2Po.hasImportedTokenTag()).toBe(true);
  });

  describe("Sorting", () => {
    const tokenIcp = createUserToken({
      universeId: OWN_CANISTER_ID,
      title: "Internet Computer",
    });
    const tokenA = createUserToken({
      universeId: principal(0),
      title: "A",
    });
    const tokenB = createUserToken({
      universeId: principal(1),
      title: "B",
    });

    const getProjectNames = async (po) =>
      Promise.all((await po.getRows()).map((row) => row.getProjectName()));

    it("should not allow sorting without order", async () => {
      const po = renderTable({
        userTokensData: [tokenIcp, tokenA],
      });

      expect(await po.getColumnHeaderWithArrow()).toBe(undefined);
    });

    it("should allow sorting when order is specified", async () => {
      const po = renderTable({
        userTokensData: [tokenIcp, tokenA],
        order: [
          {
            columnId: "balance",
          },
        ],
      });

      expect(await po.getColumnHeaderWithArrow()).toBe("Balance");
    });

    it("should change order based on order prop", async () => {
      const tokensTableOrderStore: Writable<TokensTableOrder> = writable([
        {
          columnId: "balance",
        },
      ]);
      const po = renderTable({
        userTokensData: [tokenIcp, tokenA],
        orderStore: tokensTableOrderStore,
      });

      expect(await getProjectNames(po)).toEqual(["Internet Computer", "A"]);

      tokensTableOrderStore.set([
        {
          columnId: "title",
        },
      ]);
      await runResolvedPromises();

      expect(await getProjectNames(po)).toEqual(["A", "Internet Computer"]);
    });

    it("should change order store based on clicked header", async () => {
      const tokensTableOrderStore: Writable<TokensTableOrder> = writable([
        {
          columnId: "balance",
        },
        {
          columnId: "title",
        },
      ]);
      const firstColumnHeader = "Projects";
      const po = renderTable({
        firstColumnHeader,
        userTokensData: [tokenIcp, tokenA],
        orderStore: tokensTableOrderStore,
      });

      expect(get(tokensTableOrderStore)).toEqual([
        {
          columnId: "balance",
        },
        {
          columnId: "title",
        },
      ]);

      await po.clickColumnHeader(firstColumnHeader);

      expect(get(tokensTableOrderStore)).toEqual([
        {
          columnId: "title",
        },
        {
          columnId: "balance",
        },
      ]);

      await po.clickColumnHeader("Balance");

      expect(get(tokensTableOrderStore)).toEqual([
        {
          columnId: "balance",
        },
        {
          columnId: "title",
        },
      ]);

      await po.clickColumnHeader("Balance");

      expect(get(tokensTableOrderStore)).toEqual([
        {
          columnId: "balance",
          reversed: true,
        },
        {
          columnId: "title",
        },
      ]);
    });

    it("should order imported tokens without balance before other tokens without balance", async () => {
      const po = renderTable({
        userTokensData: [tokenIcp, tokenA, tokenB],
        order: [
          {
            columnId: "balance",
          },
          {
            columnId: "title",
          },
        ],
      });

      // If B is not an imported token, it comes after A.
      expect(await getProjectNames(po)).toEqual([
        "Internet Computer",
        "A",
        "B",
      ]);

      // Make B an imported token.
      importedTokensStore.set({
        importedTokens: [
          {
            ledgerCanisterId: tokenB.universeId,
            indexCanisterId: undefined,
          },
        ],
        certified: true,
      });

      await runResolvedPromises();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // If B is an imported token, it comes before A.
      expect(await getProjectNames(po)).toEqual([
        "Internet Computer",
        "B",
        "A",
      ]);
    });
  });
});
