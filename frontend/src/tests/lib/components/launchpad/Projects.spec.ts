import Projects from "$lib/components/launchpad/Projects.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ProjectsPo } from "$tests/page-objects/Projects.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";

describe("Projects", () => {
  beforeEach(() => {
    resetSnsProjects();
  });

  const renderComponent = ({
    testId,
    status,
  }: {
    testId: string;
    status: SnsSwapLifecycle;
  }) => {
    const { container } = render(Projects, { testId, status });
    const po = ProjectsPo.under({
      element: new JestPageObjectElement(container),
      testId,
    });
    return po;
  };

  describe("should render projects sorted from newest to oldest", () => {
    const mockProjects = [
      {
        lifecycle: SnsSwapLifecycle.Adopted,
        swapOpenTimestampSeconds: 10,
        projectName: "Project Adopted 10",
      },
      {
        lifecycle: SnsSwapLifecycle.Adopted,
        swapOpenTimestampSeconds: 1,
        projectName: "Project Adopted 1",
      },
      {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: 1,
        projectName: "Project Committed 1",
      },
      {
        lifecycle: SnsSwapLifecycle.Open,
        swapOpenTimestampSeconds: 1,
        projectName: "Project Open 1",
      },
      {
        lifecycle: SnsSwapLifecycle.Open,
        swapOpenTimestampSeconds: 10,
        projectName: "Project Open 10",
      },
      {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: 10,
        projectName: "Project Committed 10",
      },
      {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: 100,
        projectName: "Project Committed 100",
      },
    ];

    beforeEach(() => {
      setSnsProjects(
        mockProjects.map(
          ({ lifecycle, swapOpenTimestampSeconds, projectName }) => ({
            lifecycle,
            swapOpenTimestampSeconds,
            projectName,
          })
        )
      );
    });

    it("should render 'Open' projects sorted from newest to oldest", async () => {
      const po = renderComponent({
        testId: "open-projects",
        status: SnsSwapLifecycle.Open,
      });
      const projects = await po.getProjectCardPos();

      expect(projects.length).toBe(
        mockProjects.filter((p) => p.lifecycle === SnsSwapLifecycle.Open).length
      );
      expect(await projects[0].getProjectName()).toBe("Project Open 10");
      expect(await projects[1].getProjectName()).toBe("Project Open 1");
    });

    it("should render 'Adopted' projects", async () => {
      const po = renderComponent({
        testId: "upcoming-projects",
        status: SnsSwapLifecycle.Adopted,
      });
      const projects = await po.getProjectCardPos();

      expect(projects.length).toBe(
        mockProjects.filter((p) => p.lifecycle === SnsSwapLifecycle.Adopted)
          .length
      );
      expect(await projects[0].getProjectName()).toBe("Project Adopted 10");
      expect(await projects[1].getProjectName()).toBe("Project Adopted 1");
    });

    it("should render 'Committed' projects sorted from newest to oldest", async () => {
      const po = renderComponent({
        testId: "committed-projects",
        status: SnsSwapLifecycle.Committed,
      });
      const projects = await po.getProjectCardPos();

      expect(projects.length).toBe(
        mockProjects.filter((p) => p.lifecycle === SnsSwapLifecycle.Committed)
          .length
      );
      expect(await projects[0].getProjectName()).toBe("Project Committed 100");
      expect(await projects[1].getProjectName()).toBe("Project Committed 10");
      expect(await projects[2].getProjectName()).toBe("Project Committed 1");
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
