import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';

export const orderService = {
  // Get all orders for a user
  getOrders: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.ORDER_BY_ID(orderId)}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Get order delivery status
  getOrderDeliveryStatus: async (orderNumber) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DELIVERY_STATUS(orderNumber));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching order delivery status:', error);
      return { success: false, error: error.message };
    }
  },

  // Update order
  updateOrder: async (orderId, updateData) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.ORDER_BY_ID(orderId)}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating order:', error);
      return { success: false, error: error.message };
    }
  },

  // Get order items
  getOrderItems: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDER_ITEMS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching order items:', error);
      return { success: false, error: error.message };
    }
  },

  // Update order item
  updateOrderItem: async (itemId, updateData) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.ORDER_ITEMS}${itemId}/`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating order item:', error);
      return { success: false, error: error.message };
    }
  },

  // Request cancellation for order items
  requestCancellation: async (itemIds, reason) => {
    try {
      const results = [];
      
      for (const itemId of itemIds) {
        const result = await orderService.updateOrderItem(itemId, {
          cancel_requested: true,
          cancel_reason: reason
        });
        results.push({ itemId, ...result });
      }
      
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        return { success: true, message: 'Cancellation requests submitted successfully' };
      } else {
        const failedItems = results.filter(result => !result.success);
        return { 
          success: false, 
          error: `Failed to submit cancellation for ${failedItems.length} items`,
          failedItems 
        };
      }
    } catch (error) {
      console.error('Error requesting cancellation:', error);
      return { success: false, error: error.message };
    }
  },

  // Request return for order items
  requestReturn: async (itemIds, reason) => {
    try {
      const results = [];
      
      for (const itemId of itemIds) {
        const result = await orderService.updateOrderItem(itemId, {
          return_requested: true,
          return_reason: reason
        });
        results.push({ itemId, ...result });
      }
      
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        return { success: true, message: 'Return requests submitted successfully' };
      } else {
        const failedItems = results.filter(result => !result.success);
        return { 
          success: false, 
          error: `Failed to submit return for ${failedItems.length} items`,
          failedItems 
        };
      }
    } catch (error) {
      console.error('Error requesting return:', error);
      return { success: false, error: error.message };
    }
  },

  // Get delivery packages
  getDeliveryPackages: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/order/delivery-packages/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching delivery packages:', error);
      return { success: false, error: error.message };
    }
  },

  // Get package items
  getPackageItems: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/order/package-items/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching package items:', error);
      return { success: false, error: error.message };
    }
  },

  // Helper function to get all order items (from packages and without package)
  getAllOrderItems: (order) => {
    let items = [];
    
    console.log('getAllOrderItems - Order data:', {
      hasItems: !!order?.items,
      itemsLength: order?.items?.length,
      hasPackages: !!order?.packages,
      packagesLength: order?.packages?.length,
      hasItemsWithoutPackage: !!order?.items_without_package,
      itemsWithoutPackageLength: order?.items_without_package?.length
    });
    
    // First check if items are directly in the order object (most common case)
    if (order?.items && Array.isArray(order.items)) {
      items = [...order.items];
      console.log('Found items directly in order:', items.length);
    }
    
    // Add items from packages
    if (order?.packages && Array.isArray(order.packages)) {
      order.packages.forEach((pkg, pkgIndex) => {
        if (pkg.package_items && Array.isArray(pkg.package_items)) {
          pkg.package_items.forEach(item => {
            items.push({
              ...item,
              package_tracking: pkg.tracking_number
            });
          });
          console.log(`Found ${pkg.package_items.length} items in package ${pkgIndex}`);
        }
      });
    }
    
    // Add items without package
    if (order?.items_without_package && Array.isArray(order.items_without_package)) {
      items = [...items, ...order.items_without_package];
      console.log('Found items without package:', order.items_without_package.length);
    }
    
    // If no items found, try alternative field names
    if (items.length === 0) {
      // Try order_items field
      if (order?.order_items && Array.isArray(order.order_items)) {
        items = [...order.order_items];
        console.log('Found items in order_items field:', items.length);
      }
      
      // Try orderItems field
      if (items.length === 0 && order?.orderItems && Array.isArray(order.orderItems)) {
        items = [...order.orderItems];
        console.log('Found items in orderItems field:', items.length);
      }
    }
    
    console.log('Total order items found:', items.length);
    return items;
  },

  // Helper function to check if order is delivered
  isOrderDelivered: (order) => {
    return order?.packages?.some(pkg => pkg.status === 'delivered') || 
           order?.items_without_package?.some(item => item.status === 'delivered');
  },

  // Helper function to check if order can be cancelled
  canCancelOrder: (order) => {
    return !orderService.isOrderDelivered(order) && order?.payment_status === 'completed';
  },

  // Helper function to check if order can be returned
  canReturnOrder: (order) => {
    return orderService.isOrderDelivered(order) && order?.payment_status === 'completed';
  },

  // Helper function to check for pending cancellation requests
  hasPendingCancelRequest: (order) => {
    const allItems = orderService.getAllOrderItems(order);
    return allItems.some(item => item.cancel_requested && !item.cancel_approved);
  },

  // Helper function to check for approved cancellation requests
  hasApprovedCancelRequest: (order) => {
    const allItems = orderService.getAllOrderItems(order);
    return allItems.some(item => item.cancel_requested && item.cancel_approved);
  },

  // Helper function to check for pending return requests
  hasPendingReturnRequest: (order) => {
    const allItems = orderService.getAllOrderItems(order);
    return allItems.some(item => item.return_requested && !item.return_approved);
  },

  // Helper function to check for approved return requests
  hasApprovedReturnRequest: (order) => {
    const allItems = orderService.getAllOrderItems(order);
    return allItems.some(item => item.return_requested && item.return_approved);
  }
};

export default orderService;
