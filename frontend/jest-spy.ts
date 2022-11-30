import type { HttpAgent } from "@dfinity/agent";
import { mock } from "jest-mock-extended";
import * as authServices from "./src/lib/services/auth.services";
import * as agent from "./src/lib/api/agent.api";
import { mockGetIdentity } from "./src/tests/mocks/auth.store.mock";

const mockCreateAgent = () => Promise.resolve(mock<HttpAgent>());
jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);

jest
  .spyOn(authServices, "getAuthenticatedIdentity")
  .mockImplementation(() => Promise.resolve(mockGetIdentity()));
