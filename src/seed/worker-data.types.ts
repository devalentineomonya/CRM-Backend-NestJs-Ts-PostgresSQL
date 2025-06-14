export interface WorkerPayload {
  dbConfig: {
    type: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    ssl?: boolean;
  };
  workerId: string;
  userIds?: string[];
  adminIds?: string[];
}
