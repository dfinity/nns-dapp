import ProjectCard from "$lib/components/launchpad/ProjectCard.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { ProjectCardPo } from "$tests/page-objects/ProjectCard.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("ProjectCard", () => {
  vi.spyOn(authStore, "subscribe").mockImplementation(
    mutableMockAuthStoreSubscribe
  );

  afterEach(() => vi.clearAllMocks());

  describe("signed in", () => {
    beforeAll(() =>
      authStoreMock.next({
        identity: mockIdentity,
      })
    );

    it("should render a logo", () => {
      const { container } = render(ProjectCard, {
        props: {
          project: mockSnsFullProject,
        },
      });

      const img = container.querySelector("img");

      expect(img).toBeInTheDocument();
      expect(img?.getAttribute("src")).toBe(
        mockSnsFullProject.summary.metadata.logo
      );
    });

    it("should render a title", () => {
      const { getByText } = render(ProjectCard, {
        props: {
          project: mockSnsFullProject,
        },
      });

      expect(
        getByText(
          `${en.sns_project.project} ${mockSnsFullProject.summary.metadata.name}`
        )
      ).toBeInTheDocument();
    });

    it("should render a description", () => {
      const { getByText } = render(ProjectCard, {
        props: {
          project: mockSnsFullProject,
        },
      });

      expect(
        getByText(mockSnsFullProject.summary.metadata.description)
      ).toBeInTheDocument();
    });

    it("should be highlighted", async () => {
      const { container } = render(ProjectCard, {
        props: {
          project: {
            ...mockSnsFullProject,
            swapCommitment: {
              rootCanisterId: mockSnsFullProject.rootCanisterId,
              myCommitment: {
                icp: [
                  {
                    transfer_start_timestamp_seconds: BigInt(123132),
                    amount_e8s: BigInt(100_000_000),
                    transfer_success_timestamp_seconds: BigInt(5443554),
                  },
                ],
              },
            },
          },
        },
      });

      const po = ProjectCardPo.under(new VitestPageObjectElement(container));

      expect(await po.isHighlighted()).toBe(true);
    });

    it("should not be highlighted without commitment", async () => {
      const { container } = render(ProjectCard, {
        props: {
          project: {
            ...mockSnsFullProject,
            swapCommitment: {
              rootCanisterId: mockSnsFullProject.rootCanisterId,
              myCommitment: undefined,
            },
          },
        },
      });

      const po = ProjectCardPo.under(new VitestPageObjectElement(container));

      expect(await po.isHighlighted()).toBe(false);
    });

    it("should display a spinner when the swapCommitment is not loaded", () => {
      const { getByTestId } = render(ProjectCard, {
        props: {
          project: { ...mockSnsFullProject, swapCommitment: undefined },
        },
      });

      expect(getByTestId("spinner")).toBeInTheDocument();
    });

    it("should render swap info", () => {
      const { getByText } = render(ProjectCard, {
        props: {
          project: mockSnsFullProject,
        },
      });

      expect(getByText(en.sns_project_detail.deadline)).toBeInTheDocument();
      expect(
        getByText(en.sns_project_detail.user_current_commitment)
      ).toBeInTheDocument();
    });
  });

  describe("not signed in", () => {
    beforeAll(() =>
      authStoreMock.next({
        identity: undefined,
      })
    );

    it("should not display a spinner when the swapCommitment is not loaded", () => {
      const { getByTestId } = render(ProjectCard, {
        props: {
          project: { ...mockSnsFullProject, swapCommitment: undefined },
        },
      });

      expect(() => getByTestId("spinner")).toThrow();
    });
  });
});
