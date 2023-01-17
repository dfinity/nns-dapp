/**
 * @jest-environment jsdom
 */

import { pageStore } from "$lib/derived/page.derived";
import { committedProjectsStore } from "$lib/derived/projects.derived";
import SelectUniverseModal from "$lib/modals/universe/SelectUniverseModal.svelte";
import { page } from "$mocks/$app/stores";
import { fireEvent } from "@testing-library/svelte";
import { get } from "svelte/store";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../../mocks/sns-projects.mock";

describe("SelectUniverseModal", () => {
  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeAll(() => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => jest.clearAllMocks());

  it("should render title", async () => {
    const { getByTestId } = await renderModal({
      component: SelectUniverseModal,
    });

    expect(
      getByTestId("select-universe-modal-title")?.textContent ?? ""
    ).toEqual(en.universe.select_token);
  });

  it("should navigate", async () => {
    const { getAllByTestId } = await renderModal({
      component: SelectUniverseModal,
    });

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[1]));

    const { universe } = get(pageStore);
    expect(universe).toEqual(mockSnsFullProject.rootCanisterId.toText());
  });
});
