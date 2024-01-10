export type QrResult = "success" | "canceled" | "token_incompatible";

export type QrResponse = {
  result: QrResult;
  identifier?: string;
  token?: string;
  amount?: number;
};
