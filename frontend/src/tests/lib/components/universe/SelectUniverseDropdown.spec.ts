import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { mockStoreSubscribe } from "$tests/mocks/commont.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  mockTokenStore,
} from "$tests/mocks/sns-projects.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

describe("SelectUniverseDropdown", () => {
  vi.spyOn(snsProjectSelectedStore, "subscribe").mockImplementation(
    mockStoreSubscribe(mockSnsFullProject)
  );

  vi.spyOn(tokensStore, "subscribe").mockImplementation(
    mockTokensSubscribe(mockUniversesTokens)
  );

  vi.spyOn(snsTokenSymbolSelectedStore, "subscribe").mockImplementation(
    mockTokenStore
  );

  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  beforeAll(() => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => vi.clearAllMocks());

  it("should render a universe card with a role button", () => {
    const { getByTestId } = render(SelectUniverseDropdown);

    const card = getByTestId("select-universe-card");
    expect(card).not.toBeNull();
    expect(card.getAttribute("role")).toEqual("button");
  });

  it("should render logo of universe", async () => {
    const { getByTestId } = render(SelectUniverseDropdown);
    await waitFor(() =>
      expect(getByTestId("logo")?.getAttribute("src")).toEqual(
        mockSnsFullProject.summary.metadata.logo
      )
    );
  });

  describe("no balance", () => {
    beforeAll(() =>
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Accounts,
      })
    );

    afterAll(() => vi.clearAllMocks());

    it("should render a skeleton on load balance", () => {
      const { container } = render(SelectUniverseDropdown);
      expect(container.querySelector(".skeleton")).not.toBeNull();
    });
  });

  describe("balance", () => {
    beforeAll(() => {
      const accounts = [mockSnsMainAccount, mockSnsSubAccount];
      const rootCanisterId = mockSnsFullProject.rootCanisterId;

      snsAccountsStore.setAccounts({
        rootCanisterId,
        accounts,
        certified: true,
      });

      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Accounts,
      });
    });

    afterAll(() => vi.clearAllMocks());

    it("should render total balance of the project", async () => {
      const { getByTestId } = render(SelectUniverseDropdown);
      expect(
        getByTestId("token-value-label")?.textContent.trim() ?? ""
      ).toEqual(
        `${formatToken({
          value:
            mockSnsMainAccount.balance.toE8s() +
            mockSnsSubAccount.balance.toE8s(),
        })} ${mockSnsMainAccount.balance.token.symbol}`
      );
    });
  });

  it("should open modal", async () => {
    const { getByTestId } = render(SelectUniverseDropdown);

    await fireEvent.click(getByTestId("select-universe-card") as HTMLElement);
    expect(getByTestId("select-universe-modal")).toBeInTheDocument();
  });
});
