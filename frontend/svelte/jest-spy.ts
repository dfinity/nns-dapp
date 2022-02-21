import * as agent from "./src/lib/utils/agent.utils";

const mockCreateAgent = () => undefined;
jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);
