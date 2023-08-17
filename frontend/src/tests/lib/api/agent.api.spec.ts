import * as agentApi from "$lib/api/agent.api";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import * as utils from "@dfinity/utils";
import { mock } from "jest-mock-extended";

jest.mock("@dfinity/utils");

const host = "http://localhost:8000";
const testPrincipal1 = Principal.fromHex("123123123");
const testPrincipal2 = Principal.fromHex("456456456");

const createIdentity = (principal: Principal) =>
  ({
    getPrincipal: () => principal,
  } as Identity);

const createAgent = (identity: Identity) =>
  agentApi.createAgent({
    identity,
    host,
  });

describe("agent-api", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    agentApi.resetAgents();

    jest
      .spyOn(utils, "createAgent")
      .mockImplementation(async ({ identity }) => {
        const mockAgent = mock<HttpAgent>();
        mockAgent.getPrincipal.mockResolvedValue(identity.getPrincipal());
        return mockAgent;
      });
  });

  it("createAgent should create an agent", async () => {
    const testIdentity = createIdentity(testPrincipal1);
    const agent = await createAgent(testIdentity);

    expect(await agent.getPrincipal()).toEqual(testPrincipal1);
  });

  it("createAgent should cache the agent for the same identity", async () => {
    const testIdentity = createIdentity(testPrincipal1);
    const agent1 = await createAgent(testIdentity);
    const agent2 = await createAgent(testIdentity);

    expect(agent1).toBe(agent2);
  });

  it("createAgent returns a different agent for a different identity", async () => {
    const testIdentity1 = createIdentity(testPrincipal1);
    const testIdentity2 = createIdentity(testPrincipal2);
    const agent1 = await createAgent(testIdentity1);
    const agent2 = await createAgent(testIdentity2);

    expect(await agent1.getPrincipal()).toEqual(testPrincipal1);
    expect(await agent2.getPrincipal()).toEqual(testPrincipal2);
  });
});
