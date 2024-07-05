import ProjectsTable from "$lib/components/staking/ProjectsTable.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { page } from "$mocks/$app/stores";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ProjectsTablePo } from "$tests/page-objects/ProjectsTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";

describe("ProjectsTable", () => {
  const snsTitle = "SNS-1";
  const snsCanisterId = principal(1111);

  const renderComponent = () => {
    const { container } = render(ProjectsTable);
    return ProjectsTablePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetSnsProjects();
    vi.useFakeTimers();

    page.mock({
      routeId: AppPath.Staking,
    });
    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
    ]);
  });

  it("should render desktop headers", async () => {
    const po = renderComponent();
    expect(await po.getDesktopColumnHeaders()).toEqual([
      "Nervous Systems",
      "", // No header for actions column.
    ]);
  });

  it("should render mobile headers", async () => {
    const po = renderComponent();
    expect(await po.getMobileColumnHeaders()).toEqual([
      "Nervous Systems",
      "", // No header for actions column.
    ]);
  });

  it("should render cell alignment classes", async () => {
    const po = renderComponent();
    const rows = await po.getRows();
    expect(await rows[0].getCellAlignments()).toEqual([
      "desktop-align-left", // Nervous Systems
      "desktop-align-right", // Actions
    ]);
  });

  it("should use correct template columns", async () => {
    const po = renderComponent();

    expect(await po.getDesktopGridTemplateColumns()).toBe(
      [
        "1fr", // Nerous Systems
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell"'
    );
  });

  it("should render neurons URL", async () => {
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getHref()).toBe(
      `/neurons/?u=${OWN_CANISTER_ID_TEXT}`
    );
    expect(await rowPos[1].getHref()).toBe(`/neurons/?u=${snsCanisterId}`);
  });

  it("should render project title", async () => {
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getProjectTitle()).toBe("Internet Computer");
    expect(await rowPos[1].getProjectTitle()).toBe(snsTitle);
  });

  it("should update table when universes store changes", async () => {
    const po = renderComponent();

    await runResolvedPromises();
    expect(await po.getProjectsTableRowPos()).toHaveLength(2);

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
      {
        projectName: "Another SNS",
        rootCanisterId: principal(2222),
      },
    ]);

    await runResolvedPromises();
    expect(await po.getProjectsTableRowPos()).toHaveLength(3);
  });
});
