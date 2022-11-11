/**
 * @jest-environment jsdom
 */

import { createSubAccount, loadAccounts } from "$lib/api/accounts.api";
import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import Accounts from "$lib/routes/Accounts.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import { committedProjectsStore } from "$lib/stores/projects.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { page } from "$mocks/$app/stores";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "../../mocks/transaction-fee.mock";
import { clickByTestId } from "../../utils/utils.test-utils";

jest.mock("$lib/api/accounts.api", () => {
  return {
    createSubAccount: jest.fn().mockResolvedValue(undefined),
    loadAccounts: jest.fn().mockImplementation(() =>
      Promise.resolve({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [],
      })
    ),
  };
});

describe("Accounts", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    jest.spyOn(console, "error").mockImplementation(jest.fn);
  });

  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeEach(() => {
    jest
      .spyOn(snsSelectedTransactionFeeStore, "subscribe")
      .mockImplementation(mockSnsSelectedTransactionFeeStoreSubscribe());

    // Reset to default value
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

    snsAccountsStore.setAccounts({
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      certified: true,
      accounts: [mockSnsMainAccount],
    });
  });

  it("should render NnsAccounts by default", () => {
    const { queryByTestId } = render(Accounts);
    expect(queryByTestId("accounts-body")).toBeInTheDocument();
  });

  it("should render dropdown to select project", () => {
    const { queryByTestId } = render(Accounts);
    expect(queryByTestId("select-project-dropdown")).toBeInTheDocument();
  });

  it("should render sns accounts when a project is selected in the dropdown", async () => {
    const { queryByTestId } = render(Accounts);

    expect(queryByTestId("accounts-body")).toBeInTheDocument();

    const selectElement = queryByTestId(
      "select-project-dropdown"
    ) as HTMLSelectElement | null;

    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    await waitFor(() =>
      expect(queryByTestId("sns-accounts-body")).toBeInTheDocument()
    );
  });

  it("should be able to go back to nns after going to a project", async () => {
    const { queryByTestId } = render(Accounts);

    expect(queryByTestId("accounts-body")).toBeInTheDocument();

    const selectElement = queryByTestId(
      "select-project-dropdown"
    ) as HTMLSelectElement | null;

    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    await waitFor(() =>
      expect(queryByTestId("sns-accounts-body")).toBeInTheDocument()
    );

    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: OWN_CANISTER_ID.toText() },
      });
    await waitFor(() =>
      expect(queryByTestId("accounts-body")).toBeInTheDocument()
    );
  });

  it("should open nns transaction modal", async () => {
    const { getByTestId } = render(Accounts);

    const button = getByTestId("open-new-transaction") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId("transaction-step-1")).toBeInTheDocument();
    });
  });

  it("should open add account modal", async () => {
    const { container, getByTestId, getByText } = render(Accounts);

    const button = getByTestId("open-add-account-modal") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(container.querySelector("div.modal")).not.toBeNull();

      expect(
        getByText(en.accounts.attach_hardware_title, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("should open sns transaction modal", async () => {
    transactionsFeesStore.setFee({
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      fee: BigInt(10_000),
      certified: true,
    });
    const { queryByTestId, getByTestId } = render(Accounts);

    expect(queryByTestId("accounts-body")).toBeInTheDocument();

    const selectElement = queryByTestId(
      "select-project-dropdown"
    ) as HTMLSelectElement | null;

    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    await waitFor(() =>
      expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
    );

    const button = getByTestId("open-new-sns-transaction") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId("transaction-step-1")).toBeInTheDocument();
    });
  });

  it("should create a subaccount", async () => {
    accountsStore.set({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [],
    });
    const { queryByTestId, container } = render(Accounts);

    await waitFor(() =>
      expect(queryByTestId("open-add-account-modal")).toBeInTheDocument()
    );

    await clickByTestId(queryByTestId, "open-add-account-modal");

    await waitFor(() =>
      expect(queryByTestId("choose-linked-as-account-type")).toBeInTheDocument()
    );

    await clickByTestId(queryByTestId, "choose-linked-as-account-type");

    await waitFor(() =>
      expect(
        container.querySelector('input[name="newAccount"]')
      ).toBeInTheDocument()
    );
    const input = container.querySelector('input[name="newAccount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: "test name" } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    await waitFor(() => expect(createSubAccount).toHaveBeenCalled());
    await waitFor(() => expect(loadAccounts).toBeCalled());
  });
});
