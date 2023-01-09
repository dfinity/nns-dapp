/**
 * @jest-environment jsdom
 */
import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { mockStoreSubscribe } from "../../../mocks/commont.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../../mocks/sns-accounts.mock";
import {
  mockSnsFullProject,
  mockTokenStore,
} from "../../../mocks/sns-projects.mock";

describe("SelectUniverseDropdown", () => {
  jest
    .spyOn(snsProjectSelectedStore, "subscribe")
    .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

  jest
    .spyOn(snsTokenSymbolSelectedStore, "subscribe")
    .mockImplementation(mockTokenStore);

  const props = { selectedCanisterId: mockSnsFullProject.rootCanisterId };

  beforeAll(() => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => jest.clearAllMocks());

  it("should render a universe card with a role button", () => {
    const { getByTestId } = render(SelectUniverseDropdown, props);

    const card = getByTestId("select-universe-card");
    expect(card).not.toBeNull();
    expect(card.getAttribute("role")).toEqual("button");
  });

  it("should logo of universe", async () => {
    const { getByTestId } = render(SelectUniverseDropdown, props);
    await waitFor(() =>
      expect(getByTestId("logo")?.getAttribute("src")).toEqual(
        mockSnsFullProject.summary.metadata.logo
      )
    );
  });

  describe("no balance", () => {
    it("should render a skeleton on load balance", () => {
      const { container } = render(SelectUniverseDropdown, props);
      expect(container.querySelector(".skeleton")).not.toBeNull();
    });
  });

  describe("balance", () => {
    beforeAll(() =>
      snsAccountsStore.setAccounts({
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        accounts: [mockSnsMainAccount, mockSnsSubAccount],
        certified: true,
      })
    );

    it("should render total balance of the project", async () => {
      const { getByTestId } = render(SelectUniverseDropdown, props);
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
    const { getByTestId } = render(SelectUniverseDropdown, props);

    await fireEvent.click(getByTestId("select-universe-card") as HTMLElement);
    expect(getByTestId("select-universe-modal")).toBeInTheDocument();
  });
});
