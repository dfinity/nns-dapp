/**
 * @jest-environment jsdom
 */
import { getProjectStatus, ProjectStatus } from "../../../lib/utils/sns.utils";
import { mockSnsFullProject } from "../../mocks/sns-projects.mock";

describe("sns-utils", () => {
  describe("getProjectStatus", () => {
    it("returns pending status", () => {
      const nowInSeconds = 1579098983;
      const summary = {
        ...mockSnsFullProject.summary,
        swapStart: BigInt(nowInSeconds + 5),
        swapDeadline: BigInt(nowInSeconds + 10),
      };

      const status = getProjectStatus({ summary, nowInSeconds });

      expect(status).toBe(ProjectStatus.Pending);
    });

    it("returns closed status", () => {
      const nowInSeconds = 1579098983;
      const summary = {
        ...mockSnsFullProject.summary,
        swapStart: BigInt(nowInSeconds - 50),
        swapDeadline: BigInt(nowInSeconds - 10),
      };

      const status = getProjectStatus({ summary, nowInSeconds });

      expect(status).toBe(ProjectStatus.Closed);
    });

    it("returns accepting status", () => {
      const nowInSeconds = 1579098983;
      const summary = {
        ...mockSnsFullProject.summary,
        swapStart: BigInt(nowInSeconds - 5),
        swapDeadline: BigInt(nowInSeconds + 10),
      };

      const status = getProjectStatus({ summary, nowInSeconds });

      expect(status).toBe(ProjectStatus.Accepting);
    });
  });
});
