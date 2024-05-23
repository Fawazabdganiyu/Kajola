export interface IDBClient {
    disconnect(): Promise<void>;
    isAlive(): boolean;
}
