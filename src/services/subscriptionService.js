// src/services/subscriptionService.js
import ApiService from './api';

class SubscriptionService {
  /**
   * Get current subscription status
   * GET /api/v1/subscription
   */
  async getSubscriptionStatus() {
    try {
      const response = await ApiService.get('/api/v1/subscription', true);
      return response;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }

  /**
   * Initiate subscription payment
   * POST /api/v1/subscription/initiate
   * @param {Object} data - { plan_id: 'monthly', interval: 'monthly' }
   */
  async initiateSubscription(data) {
    try {
      const response = await ApiService.post('/api/v1/subscription/initiate', data, true);
      return response;
    } catch (error) {
      console.error('Error initiating subscription:', error);
      throw error;
    }
  }

  /**
   * Verify payment after Paystack callback
   * POST /api/v1/subscription/verify
   * @param {string} reference - Paystack transaction reference
   */
  async verifyPayment(reference) {
    try {
      const response = await ApiService.post('/api/v1/subscription/verify', { reference }, true);
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Cancel active subscription
   * POST /api/v1/subscription/cancel
   */
  async cancelSubscription() {
    try {
      const response = await ApiService.post('/api/v1/subscription/cancel', {}, true);
      return response;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription history
   * GET /api/v1/subscription/history
   */
  async getSubscriptionHistory() {
    try {
      const response = await ApiService.get('/api/v1/subscription/history', true);
      return response;
    } catch (error) {
      console.error('Error getting subscription history:', error);
      throw error;
    }
  }

  /**
   * Get subscription invoices
   * GET /api/v1/subscription/invoices
   */
  async getInvoices() {
    try {
      const response = await ApiService.get('/api/v1/subscription/invoices', true);
      return response;
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();