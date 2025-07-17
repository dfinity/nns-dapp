import * as favProjectsApi from "$lib/api/fav-projects.api";
import type { FavProject } from "$lib/canisters/nns-dapp/nns-dapp.types";
import FavProjectButton from "$lib/components/launchpad/FavProjectButton.svelte";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import { snsFavProjectsStore } from "$lib/stores/sns-fav-projects.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import {
  createMockSnsFullProject,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { FavProjectButtonPo } from "$tests/page-objects/FavProjectButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("FavProjectButton", () => {
  const rootCanisterIdA = principal(1);
  const rootCanisterIdB = principal(2);
  const favProjectA: FavProject = {
    root_canister_id: rootCanisterIdA,
  };
  const mockProjectA = createMockSnsFullProject({
    rootCanisterId: rootCanisterIdA,
    summaryParams: {},
  });
  const mockProjectB = createMockSnsFullProject({
    rootCanisterId: rootCanisterIdB,
    summaryParams: {},
  });

  const renderComponent = (props: { project?: SnsFullProject } = {}) => {
    const { container } = render(FavProjectButton, {
      project: props.project ?? mockProjectA,
      children: createMockSnippet(),
    });
    return FavProjectButtonPo.under(new JestPageObjectElement(container));
  };

  const createMaxFavorites = () =>
    Array.from({ length: 20 }, () => rootCanisterIdA);

  beforeEach(() => {
    resetIdentity();
  });

  describe("visibility", () => {
    it("should not render when favorites are not loaded", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: undefined,
        certified: undefined,
      });

      const po = renderComponent();
      expect(await po.isVisible()).toBe(false);
    });

    it("should render when favorites are loaded", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: [],
        certified: true,
      });

      const po = renderComponent();
      expect(await po.isVisible()).toBe(true);
    });
  });

  describe("disabled state", () => {
    beforeEach(() => {
      snsFavProjectsStore.set({
        rootCanisterIds: [],
        certified: true,
      });
    });

    it("should be disabled when user participated in the project", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId: rootCanisterIdA,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
        icpCommitment: 100_000_000n,
      });

      const po = renderComponent({ project });
      expect(await po.getButtonPo().isDisabled()).toBe(true);
    });

    it("should be disabled when max favorites reached and project is not favorite", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: createMaxFavorites(),
        certified: true,
      });

      const po = renderComponent({ project: mockProjectB });
      expect(await po.getButtonPo().isDisabled()).toBe(true);
    });

    it("should be enabled when max favorites reached but project is favorite", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: createMaxFavorites(),
        certified: true,
      });

      const po = renderComponent({ project: mockProjectA });
      expect(await po.getButtonPo().isDisabled()).toBe(false);
    });
  });

  describe("tooltip", () => {
    it("should show tooltip when maximum favorites reached", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: createMaxFavorites(),
        certified: true,
      });

      const po = renderComponent();
      expect(await po.getTooltipPo().isPresent()).toBe(true);

      const tooltipText = await po.getTooltipPo().getTooltipText();
      expect(tooltipText).toContain("maximum number of favorite projects (20)");
    });

    it("should not show tooltip when under maximum", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA],
        certified: true,
      });

      const po = renderComponent();
      expect(await po.getTooltipPo().isPresent()).toBe(false);
    });
  });

  describe("favorite actions", () => {
    let spySetFavProjects: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      spySetFavProjects = vi
        .spyOn(favProjectsApi, "setFavProjects")
        .mockResolvedValue(undefined);

      // Mock the API call, as it is always called after setting the favorites
      vi.spyOn(favProjectsApi, "getFavProjects").mockResolvedValue({
        fav_projects: [],
      });
    });

    it("should add project to favorites when not favorite", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: [],
        certified: true,
      });

      const po = renderComponent({ project: mockProjectA });
      await po.getButtonPo().click();

      expect(spySetFavProjects).toHaveBeenCalledWith({
        favProjects: [favProjectA],
        identity: mockIdentity,
      });
    });

    it("should remove project from favorites when favorite", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA],
        certified: true,
      });

      const po = renderComponent({ project: mockProjectA });
      await po.getButtonPo().click();

      expect(spySetFavProjects).toHaveBeenCalledWith({
        favProjects: [],
        identity: mockIdentity,
      });
    });

    it("should allow removing favorites when max reached and project is favorite", async () => {
      snsFavProjectsStore.set({
        rootCanisterIds: createMaxFavorites(),
        certified: true,
      });

      const po = renderComponent({ project: mockProjectA });
      await po.getButtonPo().click();
      await runResolvedPromises();

      expect(spySetFavProjects).toHaveBeenCalledWith({
        favProjects: [],
        identity: mockIdentity,
      });
    });
  });
});
