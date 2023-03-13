/**
 * @jest-environment jsdom
 */

import SelectUniverseList from "$lib/components/universe/SelectUniverseList.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { page } from "$mocks/$app/stores";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { fireEvent, render } from "@testing-library/svelte";

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
    .spyOn(snsProjectsCommittedStore, "subscribe")
    .mockImplementation(mockProjectSubscribe(projects));

  beforeEach(() => {
    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  afterAll(() => jest.clearAllMocks());

  it("should render universe cards", () => {
    const { getAllByTestId } = render(SelectUniverseList);
    // +1 for Internet Computer / NNS and +1 for ckBTC +1 for ckTESTBTC
    expect(getAllByTestId("select-universe-card").length).toEqual(
      projects.length + 3
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
    component.$on("nnsSelectUniverse", onSelect);

    const cards = getAllByTestId("select-universe-card");
    cards && (await fireEvent.click(cards[0]));

    expect(onSelect).toHaveBeenCalled();
  });

  it("should not render ckBTC universe cards if route not accounts", () => {
    page.mock({
      routeId: AppPath.Neurons,
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getAllByTestId } = render(SelectUniverseList);
    // +1 for Internet Computer / NNS
    expect(getAllByTestId("select-universe-card").length).toEqual(
      projects.length + 1
    );
  });
});
