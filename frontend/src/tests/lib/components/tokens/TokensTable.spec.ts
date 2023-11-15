import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { ActionType } from "$lib/types/actions";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createUserToken,
  userTokenPageMock,
} from "$tests/mocks/tokens-page.mock";
import { TokensTablePo } from "$tests/page-objects/TokensTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { createActionEvent } from "$tests/utils/actions.test-utils";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import type { Mock } from "vitest";

describe("TokensTable", () => {
  const renderTable = ({
    userTokensData,
    onAction,
  }: {
    userTokensData: UserTokenData[];
    onAction?: Mock;
  }) => {
    const { container, component } = render(TokensTable, {
      props: { userTokensData },
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

  it("should render the balances of the tokens", async () => {
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
    });
    const token2 = createUserToken({
      universeId: principal(0),
      balance: TokenAmount.fromE8s({
        amount: 114000000n,
        token: { name: "Tetris", symbol: "TETRIS" },
      }),
    });
    const po = renderTable({ userTokensData: [token1, token2] });

    const rows = await po.getRows();
    const row1Po = rows[0];
    const row2Po = rows[1];

    expect(await row1Po.getBalance()).toBe("3.14 ICP");
    expect(await row2Po.getBalance()).toBe("1.14 TETRIS");
  });

  it("should render specific text if balance not available", async () => {
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
      balance: new UnavailableTokenAmount({ name: "ckBTC", symbol: "ckBTC" }),
    });
    const po = renderTable({ userTokensData: [token1] });

    const rows = await po.getRows();
    const row1Po = rows[0];

    expect(await row1Po.getBalance()).toBe("-/- ckBTC");
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

    expect(await rowPo.hasGoToDetailButton()).toBe(false);
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

    expect(await rowPo.hasGoToDetailButton()).toBe(false);
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

    expect(await rowPo.hasGoToDetailButton()).toBe(true);
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

  it("should trigger event when clicking in GoToDetail action", async () => {
    const handleAction = vi.fn();
    const userToken = createUserToken({
      actions: [UserTokenAction.GoToDetail],
    });
    const po = renderTable({
      userTokensData: [userToken],
      onAction: handleAction,
    });

    expect(handleAction).not.toHaveBeenCalled();
    const rows = await po.getRows();
    await rows[0].clickGoToDetail();

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(handleAction).toHaveBeenCalledWith(
      createActionEvent({
        type: ActionType.GoToTokenDetail,
        data: userToken,
      })
    );
  });
});
