import type { HttpAgent } from "@dfinity/agent";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import * as agent from "./src/lib/api/agent.api";
import * as authServices from "./src/lib/services/auth.services";
import { mockGetIdentity } from "./src/tests/mocks/auth.store.mock";

const mockCreateAgent = () => Promise.resolve(mock<HttpAgent>());
vi.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);

vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(() =>
  Promise.resolve(mockGetIdentity())
);
