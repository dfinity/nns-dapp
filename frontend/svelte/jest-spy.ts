import * as agent from "./src/lib/utils/agent.utils";

const mockCreateAgent = () => Promise.resolve(undefined);
jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);
