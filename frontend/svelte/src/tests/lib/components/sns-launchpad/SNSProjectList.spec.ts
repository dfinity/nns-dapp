/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSProjectList from "../../../../lib/components/sns-launchpad/SNSProjectList.svelte";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    loadSnsFullProjects: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("SNSProjectList", () => {
  it("should render title", async () => {
    const { queryByText } = render(SNSProjectList, {
      props: {
        projects: undefined,
        title: "test title",
        loading: false,
      },
    });
    expect(queryByText("test title")).toBeInTheDocument();
  });

  it("should render nothing when no projects available", async () => {
    const { queryByText, queryAllByTestId } = render(SNSProjectList, {
      props: {
        projects: [],
        title: "test title",
        loading: false,
      },
    });

    expect(queryByText("test title")).not.toBeInTheDocument();
    expect(queryAllByTestId("skeleton-card").length).toBe(0);
    expect(queryAllByTestId("card").length).toBe(0);
  });

  it("should render skeletons on loading", async () => {
    const { queryAllByTestId } = render(SNSProjectList, {
      props: {
        projects: undefined,
        title: "test title",
        loading: true,
      },
    });
    expect(queryAllByTestId("skeleton-card").length).toBeGreaterThanOrEqual(1);
  });
});
