
import Projects from "$lib/components/launchpad/Projects.svelte";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";

describe("Projects", () => {
  beforeEach(() => {
    resetSnsProjects();
    vitest.clearAllMocks();
  });

  it("should render 'Open' projects", () => {
    const lifecycles = [
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Committed,
      SnsSwapLifecycle.Open,
    ];

    setSnsProjects(lifecycles.map((lifecycle) => ({ lifecycle })));

    const { getAllByTestId } = render(Projects, {
      props: {
        testId: "open-projects",
        status: SnsSwapLifecycle.Open,
      },
    });

    expect(getAllByTestId("project-card-component").length).toBe(
      lifecycles.filter((lc) => lc === SnsSwapLifecycle.Open).length
    );
  });

  it("should render 'Adopted' projects", () => {
    const lifecycles = [
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Adopted,
      SnsSwapLifecycle.Committed,
      SnsSwapLifecycle.Adopted,
    ];

    setSnsProjects(lifecycles.map((lifecycle) => ({ lifecycle })));

    const { getAllByTestId } = render(Projects, {
      props: {
        testId: "upcoming-projects",
        status: SnsSwapLifecycle.Adopted,
      },
    });

    expect(getAllByTestId("project-card-component").length).toBe(
      lifecycles.filter((lc) => lc === SnsSwapLifecycle.Adopted).length
    );
  });

  it("should render 'Committed' projects", () => {
    const lifecycles = [
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Committed,
      SnsSwapLifecycle.Open,
    ];

    setSnsProjects(lifecycles.map((lifecycle) => ({ lifecycle })));

    const { getAllByTestId } = render(Projects, {
      props: {
        testId: "committed-projects",
        status: SnsSwapLifecycle.Committed,
      },
    });

    expect(getAllByTestId("project-card-component").length).toBe(
      lifecycles.filter((lc) => lc === SnsSwapLifecycle.Committed).length
    );
  });

  it("should render a message when no open projects available", () => {
    setSnsProjects([
      {
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);

    const { queryByTestId } = render(Projects, {
      props: {
        testId: "open-projects",
        status: SnsSwapLifecycle.Open,
      },
    });

    expect(queryByTestId("no-projects-message")).toBeInTheDocument();
  });

  it("should render a message when no adopted projects available", () => {
    setSnsProjects([
      {
        lifecycle: SnsSwapLifecycle.Open,
      },
    ]);

    const { queryByTestId } = render(Projects, {
      props: {
        testId: "upcoming-projects",
        status: SnsSwapLifecycle.Adopted,
      },
    });

    expect(queryByTestId("no-projects-message")).toBeInTheDocument();
  });

  it("should render a message when no committed projects available", () => {
    setSnsProjects([
      {
        lifecycle: SnsSwapLifecycle.Open,
      },
    ]);

    const { queryByTestId } = render(Projects, {
      props: {
        testId: "committed-projects",
        status: SnsSwapLifecycle.Committed,
      },
    });

    expect(queryByTestId("no-projects-message")).toBeInTheDocument();
  });

  it("should render skeletons", async () => {
    const { getAllByTestId } = render(Projects, {
      props: {
        testId: "open-projects",
        status: SnsSwapLifecycle.Open,
      },
    });

    await waitFor(() =>
      expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0)
    );
  });
});
