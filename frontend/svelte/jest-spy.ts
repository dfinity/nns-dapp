import type { HttpAgent } from "@dfinity/agent";
import { mock } from "jest-mock-extended";
import * as agent from "./src/lib/utils/agent.utils";

const mockCreateAgent = () => Promise.resolve(mock<HttpAgent>());
jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);
