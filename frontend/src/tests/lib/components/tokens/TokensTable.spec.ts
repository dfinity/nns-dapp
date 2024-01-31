import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { ActionType } from "$lib/types/actions";
import {
  UserTokenAction,
  type UserTokenData,
  type UserTokenLoading,
} from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createUserToken,
  createUserTokenLoading,
  userTokenPageMock,
} from "$tests/mocks/tokens-page.mock";
import { TokensTablePo } from "$tests/page-objects/TokensTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { createActionEvent } from "$tests/utils/actions.test-utils";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";
import type { Mock } from "vitest";
import TokensTableTest from "./TokensTableTest.svelte";

describe("TokensTable", () => {
  const renderTable = ({
    userTokensData,
    firstColumnHeader,
    onAction,
  }: {
    userTokensData: Array<UserTokenData | UserTokenLoading>;
    firstColumnHeader?: string;
    onAction?: Mock;
  }) => {
    const { container, component } = render(TokensTable, {
      props: { userTokensData, firstColumnHeader },
    });

    component.$on("nnsAction", onAction);

    return TokensTablePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("should render the subtitle if present", async () => {
    const subtitle = "Hardware Wallet";
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

  it("should render href link if rowHref is present", async () => {
    const href = "/accounts";
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
      rowHref: href,
    });
    const token2 = createUserToken({
      universeId: principal(0),
      balance: TokenAmount.fromE8s({
        amount: 114000000n,
        token: { name: "Tetris", symbol: "TETRIS", decimals: 8 },
      }),
      rowHref: undefined,
    });
    const po = renderTable({ userTokensData: [token1, token2] });

    const rows = await po.getRows();
    const row1Po = rows[0];
    const row2Po = rows[1];

    expect(await row1Po.getHref()).toBe(href);
    expect(await row2Po.getHref()).toBeNull();
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

  it("should trigger event when clicking in the row", async () => {
    const handleAction = vi.fn();
    const po = renderTable({
      userTokensData: [userTokenPageMock],
      onAction: handleAction,
    });

    const rows = await po.getRows();
    await rows[0].click();

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(handleAction).toHaveBeenCalledWith(
      createActionEvent({
        type: ActionType.GoToTokenDetail,
        data: userTokenPageMock,
      })
    );
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
});
