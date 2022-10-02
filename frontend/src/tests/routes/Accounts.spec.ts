/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { OWN_CANISTER_ID } from "../../lib/constants/canister-ids.constants";
import { AppPath } from "../../lib/constants/routes.constants";
import Accounts from "../../lib/routes/Accounts.svelte";
import { committedProjectsStore } from "../../lib/stores/projects.store";
import { routeStore } from "../../lib/stores/route.store";
import en from "../mocks/i18n.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../mocks/sns-projects.mock";

jest.mock("../../lib/services/sns-accounts.services", () => {
  return {
    loadSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Accounts", () => {
  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeEach(() => {
    // Reset to default value
    routeStore.update({ path: AppPath.LegacyAccounts });
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

  it("should open transaction modal", async () => {
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
});
