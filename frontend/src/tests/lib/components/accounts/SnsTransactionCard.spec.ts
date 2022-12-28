/**
 * @jest-environment jsdom
 */

import SnsTransactionCard from "$lib/components/accounts/SnsTransactionCard.svelte";
import { projectsStore } from "$lib/stores/projects.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { render } from "@testing-library/svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../../mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../../mocks/sns-projects.mock";
import { createSnstransactionWithId } from "../../../mocks/sns-transactions.mock";

describe("SnsTransactionCard", () => {
  const renderTransactionCard = (
    account,
    transactionWithId,
    rootCanisterId = mockSnsFullProject.rootCanisterId
  ) =>
    render(SnsTransactionCard, {
      props: {
        account,
        transactionWithId,
        toSelfTransaction: false,
        rootCanisterId,
      },
    });

  const to = {
    owner: mockPrincipal,
    subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
  };
  const from = {
    owner: mockPrincipal,
    subaccount: [] as [],
  };
  const transactionFromMainToSubaccount = createSnstransactionWithId(to, from);

  beforeEach(() => {
    jest
      .spyOn(projectsStore, "subscribe")
      .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));
  });

  it("renders received headline", () => {
    const { getByText } = renderTransactionCard(
      mockSnsSubAccount,
      transactionFromMainToSubaccount
    );

    const expectedText = replacePlaceholders(en.transaction_names.receive, {
      $tokenSymbol: mockSnsSubAccount.balance.token.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders sent headline", () => {
    const { getByText } = renderTransactionCard(
      mockSnsMainAccount,
      transactionFromMainToSubaccount
    );

    const expectedText = replacePlaceholders(en.transaction_names.send, {
      $tokenSymbol: mockSnsSubAccount.balance.token.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders stake neuron headline", () => {
    const toGov = {
      owner: mockSnsFullProject.summary.governanceCanisterId,
      subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
    };
    const stakeNeuronTransaction = createSnstransactionWithId(toGov, from);
    stakeNeuronTransaction.transaction.transfer[0].memo = [new Uint8Array()];
    const { getByText } = renderTransactionCard(
      mockSnsMainAccount,
      stakeNeuronTransaction,
      mockSnsFullProject.rootCanisterId
    );

    const expectedText = replacePlaceholders(en.transaction_names.stakeNeuron, {
      $tokenSymbol: mockSnsSubAccount.balance.token.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders transaction Token symbol with - sign", () => {
    const account = mockSnsMainAccount;
    const transaction = transactionFromMainToSubaccount;
    const { getByTestId } = renderTransactionCard(account, transaction);

    const fee = transaction.transaction.transfer[0]?.fee[0];
    const amount = transaction.transaction.transfer[0]?.amount;
    expect(getByTestId("token-value")?.textContent).toBe(
      `-${formatToken({
        value: amount + fee,
        detailed: true,
      })}`
    );
  });

  it("renders transaction Tokens with + sign", () => {
    const account = mockSnsSubAccount;
    const transaction = transactionFromMainToSubaccount;
    const { getByTestId } = renderTransactionCard(account, transaction);

    const amount = transaction.transaction.transfer[0]?.amount;
    expect(getByTestId("token-value")?.textContent).toBe(
      `+${formatToken({ value: amount, detailed: true })}`
    );
  });

  it("displays transaction date and time", () => {
    const { getByTestId } = renderTransactionCard(
      mockSnsMainAccount,
      transactionFromMainToSubaccount
    );

    const div = getByTestId("transaction-date");

    expect(div?.textContent).toContain("Jan 1, 1970");
    expect(div?.textContent).toContain("12:00 AM");
  });

  it("displays identifier for received", () => {
    const { getByTestId } = renderTransactionCard(
      mockSnsSubAccount,
      transactionFromMainToSubaccount
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockSnsMainAccount.identifier);
    expect(identifier).toContain(en.wallet.direction_from);
  });

  it("displays identifier for sent", () => {
    const { getByTestId } = renderTransactionCard(
      mockSnsMainAccount,
      transactionFromMainToSubaccount
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockSnsSubAccount.identifier);
    expect(identifier).toContain(en.wallet.direction_to);
  });
});
