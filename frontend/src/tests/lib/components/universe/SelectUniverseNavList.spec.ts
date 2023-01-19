/**
 * @jest-environment jsdom
 */

import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
import { pageStore } from "$lib/derived/page.derived";
import { committedProjectsStore } from "$lib/derived/projects.derived";
import { page } from "$mocks/$app/stores";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../../mocks/sns-projects.mock";

describe("SelectUniverseNavList", () => {
  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeAll(() => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => jest.clearAllMocks());

  it("should render universe cards as links", () => {
    const { getAllByRole } = render(SelectUniverseNavList);
    // 1 for Sns project + 1 for Internet Computer - NNS
    expect(getAllByRole("link").length).toEqual(2);
  });

  it("should navigate", async () => {
    const { getAllByTestId } = render(SelectUniverseNavList);

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[1]));

    const { universe } = get(pageStore);
    await waitFor(() =>
      expect(universe).toEqual(mockSnsFullProject.rootCanisterId.toText())
    );
  });
});
