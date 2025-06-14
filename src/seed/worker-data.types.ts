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
  entityType: string;
  workerId: string;
  userIds?: string[];
  adminIds?: string[];
}

export interface WorkerResult {
  type: 'done' | 'progress' | 'error';
  counts?: Record<string, number>;
  status: 'done' | 'chunk' | 'progress' | 'error';
  message: string;
  error: string;
  usersProcessed: number;
  adminsProcessed: number;
  totalUsers: number;
  totalAdmins: number;
  chunkSize: number;
}
