import type { HttpAgent, ObservableLog } from "@icp-sdk/core/agent";
import { mock } from "vitest-mock-extended";

export const mockCreateAgent = async () =>
  mock<HttpAgent>({
    log: mock<ObservableLog>({
      subscribe: vi.fn(),
    }),
  });
