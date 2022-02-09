import { HttpAgent } from "@dfinity/agent";

const host = process.env.SERVICE_URL;

// To avoid being executed in tests that only import it
export const createAgent = () => new HttpAgent({ host });
