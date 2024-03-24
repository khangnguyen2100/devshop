import { OrderStatus } from '../types/Order';

const orderStatus: Record<string, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELED: 'canceled',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
};
const orderStatusColorMap = {
  pending: 'FFA500', // Orange
  confirmed: 'FFFF00', // Yellow
  canceled: 'FF0000', // Red
  shipped: '008000', // Green
  completed: '0000FF', // Blue
};
export { orderStatus, orderStatusColorMap };
