import DesktopTokensTable from "$lib/components/tokens/DesktopTokensTable/DesktopTokensTable.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { UserTokenActions, type UserTokenData } from "$lib/types/tokens-page";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createUserToken,
  userTokensPageMock,
} from "$tests/mocks/tokens-page.mock";
import { DesktopTokensTablePo } from "$tests/page-objects/DesktopTokensTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import type { Mock } from "vitest";

describe("DesktopTokensTable", () => {
  const renderTable = ({
    tokens,
    onGoToDetail,
    onReceive,
    onSend,
    onRowClick,
  }: {
    tokens: UserTokenData[];
    onReceive?: Mock;
    onSend?: Mock;
    onGoToDetail?: Mock;
    onRowClick?: Mock;
  }) => {
    const { container, component } = render(DesktopTokensTable, {
      props: { tokens },
    });

    component.$on("nnsReceive", onReceive);
    component.$on("nnsSend", onSend);
    component.$on("nnsGoToDetail", onGoToDetail);
    component.$on("nnsRowClick", onRowClick);

    return DesktopTokensTablePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render a row per token", async () => {
    const po = renderTable({ tokens: userTokensPageMock });

    expect(await po.getRows()).toHaveLength(userTokensPageMock.length);
  });

  it("should render the balances of the tokens", async () => {
    const token1 = createUserToken({
      canisterId: OWN_CANISTER_ID,
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
    });
    const token3 = createUserToken({
      canisterId: principal(0),
      balance: TokenAmount.fromE8s({
        amount: 114000000n,
        token: { name: "Tetris", symbol: "TETRIS" },
      }),
    });
    const po = renderTable({ tokens: [token1, token3] });

    const rows = await po.getRows();
    const row1Po = rows[0];
    const row2Po = rows[1];

    expect(await row1Po.getBalance()).toBe("3.14 ICP");
    expect(await row2Po.getBalance()).toBe("1.14 TETRIS");
  });

  it("should render a button per action", async () => {
    const po = renderTable({
      tokens: [
        createUserToken({
          actions: [
            UserTokenActions.Send,
            UserTokenActions.Receive,
            UserTokenActions.GoToDetail,
          ],
        }),
      ],
    });

    const rows = await po.getRows();
    const rowPo = rows[0];

    expect(await rowPo.hasGoToDetailButton()).toBe(true);
    expect(await rowPo.hasReceiveButton()).toBe(true);
    expect(await rowPo.hasSendButton()).toBe(true);
  });

  it("should not render a button if action is not present", async () => {
    const po = renderTable({
      tokens: [
        createUserToken({
          actions: [],
        }),
      ],
    });

    const rows = await po.getRows();
    const rowPo = rows[0];

    expect(await rowPo.hasGoToDetailButton()).toBe(false);
    expect(await rowPo.hasReceiveButton()).toBe(false);
    expect(await rowPo.hasSendButton()).toBe(false);
  });

  it("should trigger event when clicking in the row", async () => {
    const handleRowClick = vi.fn();
    const po = renderTable({
      tokens: [createUserToken()],
      onRowClick: handleRowClick,
    });

    const rows = await po.getRows();
    await rows[0].click();

    expect(handleRowClick).toHaveBeenCalledTimes(1);
  });

  it("should trigger event when clicking in Send action", async () => {
    const handleRowClick = vi.fn();
    const handleSend = vi.fn();
    const po = renderTable({
      tokens: [
        createUserToken({
          actions: [UserTokenActions.Send],
        }),
      ],
      onRowClick: handleRowClick,
      onSend: handleSend,
    });

    expect(handleSend).not.toHaveBeenCalled();
    const rows = await po.getRows();
    await rows[0].clickSend();

    expect(handleRowClick).not.toHaveBeenCalled();
    expect(handleSend).toHaveBeenCalledTimes(1);
  });

  it("should trigger event when clicking in Receive action", async () => {
    const handleRowClick = vi.fn();
    const handleReceive = vi.fn();
    const po = renderTable({
      tokens: [
        createUserToken({
          actions: [UserTokenActions.Receive],
        }),
      ],
      onRowClick: handleRowClick,
      onReceive: handleReceive,
    });

    expect(handleReceive).not.toHaveBeenCalled();
    const rows = await po.getRows();
    await rows[0].clickReceive();

    expect(handleRowClick).not.toHaveBeenCalled();
    expect(handleReceive).toHaveBeenCalledTimes(1);
  });

  it("should trigger event when clicking in GoToDetail action", async () => {
    const handleRowClick = vi.fn();
    const handleGoTo = vi.fn();
    const po = renderTable({
      tokens: [
        createUserToken({
          actions: [UserTokenActions.GoToDetail],
        }),
      ],
      onRowClick: handleRowClick,
      onGoToDetail: handleGoTo,
    });

    expect(handleGoTo).not.toHaveBeenCalled();
    const rows = await po.getRows();
    await rows[0].clickGoToDetail();

    expect(handleRowClick).not.toHaveBeenCalled();
    expect(handleGoTo).toHaveBeenCalledTimes(1);
  });
});
