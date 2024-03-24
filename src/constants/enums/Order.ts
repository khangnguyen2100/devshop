import { OrderStatus } from '../types/Order';

const orderStatus: Record<string, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELED: 'canceled',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
};
export { orderStatus };
