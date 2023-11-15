import IcrcTransactionCard from "$lib/components/accounts/IcrcTransactionCard.svelte";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import type { Account } from "$lib/types/account";
import {
  mapIcrcTransaction,
  type mapIcrcTransactionType,
} from "$lib/utils/icrc-transactions.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import { createIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { TransactionCardPo } from "$tests/page-objects/TransactionCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import type { IcrcTransactionWithId } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import type { Token } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("IcrcTransactionCard", () => {
  const renderComponent = ({
    account,
    transactionWithId,
    governanceCanisterId = undefined,
    token,
    mapTransaction,
  }: {
    account: Account;
    transactionWithId: IcrcTransactionWithId;
    governanceCanisterId?: Principal;
    token: Token | undefined;
    mapTransaction?: mapIcrcTransactionType;
  }) => {
    const { container } = render(IcrcTransactionCard, {
      props: {
        account,
        transactionWithId,
        toSelfTransaction: false,
        governanceCanisterId,
        token,
        mapTransaction: mapTransaction ?? mapIcrcTransaction,
      },
    });
    return TransactionCardPo.under(new JestPageObjectElement(container));
  };

  const subaccount = {
    owner: mockPrincipal,
    subaccount: [Uint8Array.from(mockSubAccountArray)] as [Uint8Array],
  };
  const mainAccount = {
    owner: mockPrincipal,
    subaccount: [] as [],
  };
  const transactionFromMainToSubaccount = createIcrcTransactionWithId({
    to: subaccount,
    from: mainAccount,
  });
  const transactionToMainFromSubaccount = createIcrcTransactionWithId({
    to: mainAccount,
    from: subaccount,
  });

  beforeEach(() => {
    vi.spyOn(snsProjectsStore, "subscribe").mockImplementation(
      mockProjectSubscribe([mockSnsFullProject])
    );
  });

  it("renders received headline", async () => {
    const po = renderComponent({
      account: mockSnsSubAccount,
      transactionWithId: transactionFromMainToSubaccount,
      token: mockSnsToken,
    });

    expect(await po.getHeadline()).toBe("Received");
  });

  it("renders sent headline", async () => {
    const po = renderComponent({
      account: mockSnsMainAccount,
      transactionWithId: transactionFromMainToSubaccount,
      token: mockSnsToken,
    });

    expect(await po.getHeadline()).toBe("Sent");
  });

  it("renders stake neuron headline", async () => {
    const toGov = {
      owner: mockSnsFullProject.summary.governanceCanisterId,
      subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
    };
    const stakeNeuronTransaction = createIcrcTransactionWithId({
      to: toGov,
      from: mainAccount,
    });
    stakeNeuronTransaction.transaction.transfer[0].memo = [new Uint8Array()];
    const po = renderComponent({
      account: mockSnsMainAccount,
      transactionWithId: stakeNeuronTransaction,
      governanceCanisterId: mockSnsFullProject.summary.governanceCanisterId,
      token: mockSnsToken,
    });

    expect(await po.getHeadline()).toBe("Stake Neuron");
  });

  it("renders transaction Token symbol with - sign", async () => {
    const account = mockSnsMainAccount;
    const po = renderComponent({
      account,
      transactionWithId: createIcrcTransactionWithId({
        from: mainAccount,
        to: subaccount,
        amount: 123_000_000n,
        fee: 10_000n,
      }),
      token: mockSnsToken,
    });

    expect(await po.getAmount()).toBe("-1.2301");
  });

  it("renders transaction Tokens with + sign", async () => {
    const account = mockSnsSubAccount;
    const po = renderComponent({
      account,
      transactionWithId: createIcrcTransactionWithId({
        from: mainAccount,
        to: subaccount,
        amount: 123_000_000n,
        fee: 10_000n,
      }),
      token: mockSnsToken,
    });

    expect(await po.getAmount()).toBe("+1.23");
  });

  it("displays transaction date and time", async () => {
    const po = renderComponent({
      account: mockSnsMainAccount,
      transactionWithId: transactionFromMainToSubaccount,
      token: mockSnsToken,
    });

    expect(normalizeWhitespace(await po.getDate())).toBe(
      "Jan 1, 1970 12:00 AM"
    );
  });

  it("displays identifier for received", async () => {
    const po = renderComponent({
      account: mockSnsSubAccount,
      transactionWithId: transactionFromMainToSubaccount,
      token: mockSnsToken,
    });
    const identifier = await po.getIdentifier();

    expect(identifier).toBe(`From: ${mockSnsMainAccount.identifier}`);
  });

  it("displays identifier for sent for main sns account", async () => {
    const po = renderComponent({
      account: mockSnsMainAccount,
      transactionWithId: transactionFromMainToSubaccount,
      token: mockSnsToken,
    });
    const identifier = await po.getIdentifier();

    expect(identifier).toBe(`To: ${mockSnsSubAccount.identifier}`);
  });

  it("displays identifier for sent for sub sns account", async () => {
    const po = renderComponent({
      account: mockSnsSubAccount,
      transactionWithId: transactionToMainFromSubaccount,
      token: mockSnsToken,
    });
    const identifier = await po.getIdentifier();

    expect(identifier).toBe(`To: ${mockSnsMainAccount.identifier}`);
  });

  it("renders no transaction card if token is unlikely undefined", async () => {
    const po = renderComponent({
      account: mockSnsSubAccount,
      transactionWithId: transactionFromMainToSubaccount,
      token: undefined,
    });

    expect(await po.isPresent()).toBe(false);
  });

  it("uses mapTransaction", async () => {
    const customIdentifier = "custom identifier";
    const customMapTransaction = (params) => ({
      ...mapIcrcTransaction(params),
      to: customIdentifier,
    });

    const po = renderComponent({
      account: mockSnsMainAccount,
      transactionWithId: transactionFromMainToSubaccount,
      token: mockSnsToken,
      mapTransaction: customMapTransaction,
    });
    const identifier = await po.getIdentifier();

    expect(identifier).toBe(`To: ${customIdentifier}`);
  });
});
