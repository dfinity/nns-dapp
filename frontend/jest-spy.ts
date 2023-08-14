import type { HttpAgent } from "@dfinity/agent";
import { mock } from "jest-mock-extended";
import * as agent from "./src/lib/api/agent.api";

const mockCreateAgent = () => Promise.resolve(mock<HttpAgent>());
jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);
