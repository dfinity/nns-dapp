/**
 * @jest-environment jsdom
 */

import SelectUniverseList from "$lib/components/universe/SelectUniverseList.svelte";
import { committedProjectsStore } from "$lib/derived/projects.store";
import { page } from "$mocks/$app/stores";
import { fireEvent, render } from "@testing-library/svelte";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  principal,
} from "../../../mocks/sns-projects.mock";

describe("SelectUniverseList", () => {
  const projects = [
    mockSnsFullProject,
    {
      ...mockSnsFullProject,
      rootCanisterId: principal(1),
      summary: {
        ...mockSnsFullProject.summary,
        metadata: {
          ...mockSnsFullProject.summary.metadata,
          name: "another name",
        },
      },
    },
  ];

  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe(projects));

  beforeAll(() => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => jest.clearAllMocks());

  it("should render universe cards", () => {
    const { getAllByTestId } = render(SelectUniverseList);
    // +1 for Internet Computer - NNS
    expect(getAllByTestId("select-universe-card").length).toEqual(
      projects.length + 1
    );
  });

  it("should render project selected", () => {
    const { container } = render(SelectUniverseList);
    const card = container.querySelector(".selected");
    expect(card?.textContent.trim() ?? "").toEqual(
      projects[0].summary.metadata.name
    );
    expect(card?.textContent.trim() ?? "").not.toEqual(
      projects[1].summary.metadata.name
    );
  });

  it("should trigger select project", async () => {
    const { component, getAllByTestId } = render(SelectUniverseList);

    const onSelect = jest.fn();
    component.$on("nnsSelectProject", onSelect);

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[0]));

    expect(onSelect).toHaveBeenCalled();
  });
});
