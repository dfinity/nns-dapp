import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { pageStore } from "$lib/derived/page.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import SelectUniverseModal from "$lib/modals/universe/SelectUniverseModal.svelte";
import { page } from "$mocks/$app/stores";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { fireEvent } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("SelectUniverseModal", () => {
  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  beforeAll(() => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => vi.clearAllMocks());

  it("should render title", async () => {
    const { getByTestId } = await renderModal({
      component: SelectUniverseModal,
    });

    expect(
      getByTestId("select-universe-modal-title")?.textContent ?? ""
    ).toEqual(en.universe.select_token);
  });

  it("should navigate to ckbtc", async () => {
    const { getAllByTestId } = await renderModal({
      component: SelectUniverseModal,
    });

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[1]));

    const { universe } = get(pageStore);
    expect(universe).toEqual(CKBTC_LEDGER_CANISTER_ID.toText());
  });

  it("should navigate to sns", async () => {
    const { getAllByTestId } = await renderModal({
      component: SelectUniverseModal,
    });

    // Card 0 = Nns
    // Card 1 = ckBTC
    // Card 2 = ckBTC (Testnet)
    // Card 3 = Sns

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[3]));

    const { universe } = get(pageStore);
    expect(universe).toEqual(mockSnsFullProject.rootCanisterId.toText());
  });
});
