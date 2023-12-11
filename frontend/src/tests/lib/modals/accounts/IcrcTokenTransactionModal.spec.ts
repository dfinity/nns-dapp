import * as ledgerApi from "$lib/api/icrc-ledger.api";
import { AppPath } from "$lib/constants/routes.constants";
import IcrcTokenTransactionModal from "$lib/modals/accounts/IcrcTokenTransactionModal.svelte";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { page } from "$mocks/$app/stores";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockIcrcMainAccount } from "$tests/mocks/icrc-accounts.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { IcrcTokenTransactionModalPo } from "$tests/page-objects/IcrcTokenTransactionModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { TokenAmountV2 } from "@dfinity/utils";

vi.mock("$lib/api/icrc-ledger.api");

describe("IcrcTokenTransactionModal", () => {
  const ledgerCanisterId = mockPrincipal;
  const token = mockCkETHToken;
  const transactionFee = TokenAmountV2.fromUlps({
    amount: token.fee,
    token,
  });

  beforeEach(() => {
    resetIdentity();
    page.mock({
      data: { universe: ledgerCanisterId.toText() },
      routeId: AppPath.Accounts,
    });
    icrcAccountsStore.reset();
    vi.spyOn(ledgerApi, "icrcTransfer").mockResolvedValue(1234n);
  });

  it("should transfer tokens", async () => {
    // Used to choose the source account
    icrcAccountsStore.set({
      universeId: ledgerCanisterId,
      accounts: {
        accounts: [
          {
            ...mockIcrcMainAccount,
            balanceUlps: 1000n * 10n ** 18n,
          },
        ],
        certified: true,
      },
    });

    const { container } = await renderModal({
      component: IcrcTokenTransactionModal,
      props: {
        ledgerCanisterId,
        token,
        transactionFee,
      },
    });

    const po = IcrcTokenTransactionModalPo.under(
      new JestPageObjectElement(container)
    );

    const toAccount = {
      owner: principal(2),
    };
    const amount = 10;

    await po.transferToAddress({
      destinationAddress: encodeIcrcAccount(toAccount),
      amount,
    });

    expect(ledgerApi.icrcTransfer).toHaveBeenCalledTimes(1);
    expect(ledgerApi.icrcTransfer).toHaveBeenCalledWith({
      identity: mockIdentity,
      canisterId: ledgerCanisterId,
      amount: BigInt(amount) * 10n ** 18n,
      to: toAccount,
      fee: token.fee,
    });
  });
});
