/**
 * @jest-environment jsdom
 */

import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
import { pageStore } from "$lib/derived/page.derived";
import { committedProjectsStore } from "$lib/stores/projects.store";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../../mocks/sns-projects.mock";

describe("SelectUniverseNavList", () => {
  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  afterAll(() => jest.clearAllMocks());

  it("should render universe cards as links", () => {
    const { getAllByRole } = render(SelectUniverseNavList, {
      props: { selectedCanisterId: mockSnsFullProject.rootCanisterId.toText() },
    });
    // 1 for Sns project + 1 for Internet Computer - NNS
    expect(getAllByRole("link").length).toEqual(2);
  });

  it("should navigate", async () => {
    const { getAllByTestId } = render(SelectUniverseNavList, {
      props: { selectedCanisterId: mockSnsFullProject.rootCanisterId.toText() },
    });

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[1]));

    const { universe } = get(pageStore);
    expect(universe).toEqual(mockSnsFullProject.rootCanisterId.toText());
  });
});
