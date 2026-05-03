export type LoadStatus = 'GREEN' | 'ORANGE' | 'RED';

export interface OperatorWorkload {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  activeOrders: number;
  loadStatus: LoadStatus;
  displayColor: string;
}
