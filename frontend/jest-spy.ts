import type { HttpAgent } from "@dfinity/agent";
import { mock } from "jest-mock-extended";
import * as agent from "./src/lib/api/agent.api";
import * as authServices from "./src/lib/services/auth.services";
import { resetIdentity, mockGetIdentity } from "./src/tests/mocks/auth.store.mock";

const mockCreateAgent = () => Promise.resolve(mock<HttpAgent>());
jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);

resetIdentity();
jest
  .spyOn(authServices, "getAuthenticatedIdentity")
  .mockImplementation(() => Promise.resolve(mockGetIdentity()));
