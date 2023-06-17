// Unix timestamps in seconds
export type DashboardTimestamp = number;

export type ExecutionRate = number;

export type DashboardMessageExecutionRate = [DashboardTimestamp, ExecutionRate];

export type DashboardMessageExecutionRateResponse = {
  message_execution_rate: DashboardMessageExecutionRate[];
} | null;
