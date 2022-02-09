import { HttpAgent } from "@dfinity/agent";

const host = process.env.IDENTITY_SERVICE_URL;

// To avoid being executed in tests that only import it
export const createAgent = () => new HttpAgent({ host });
