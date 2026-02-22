/**
 * AI Agent Engine - Autonomous Operations Manager
 * Predictive logic for inventory, refills, adherence, and risk scoring
 */

export const ALERT_PRIORITY = {
  CRITICAL: 'critical',   // Stockout imminent, escalate immediately
  HIGH: 'high',           // Urgent refill needed
  MODERATE: 'moderate',   // Plan refill soon
  LOW: 'low',             // Batch with other alerts
};

export const SYSTEM_HEALTH = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
};

/**
 * Calculate estimated depletion date based on daily consumption rate
 * @param {number} currentStock - Current units in stock
 * @param {number} dailyConsumption - Units consumed per day (from dosage + patient count)
 * @returns {Date|null} Estimated depletion date
 */
export function calculateDepletionDate(currentStock, dailyConsumption) {
  if (!dailyConsumption || dailyConsumption <= 0) return null;
  const daysUntilDepleted = Math.floor(currentStock / dailyConsumption);
  const date = new Date();
  date.setDate(date.getDate() + daysUntilDepleted);
  return date;
}

/**
 * Calculate daily consumption from historical sales/orders
 * @param {Array} orderHistory - Orders with items
 * @param {string} medicineId - Medicine to analyze
 * @param {number} daysToAnalyze - Lookback period in days
 * @returns {number} Average units consumed per day
 */
export function calculateDailyConsumption(orderHistory, medicineId, daysToAnalyze = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToAnalyze);
  
  let totalUnits = 0;
  orderHistory.forEach(order => {
    const orderDate = new Date(order.orderDate || order.createdAt);
    if (orderDate < cutoff) return;
    
    const item = order.items?.find(i => i.medicineId === medicineId || i.medicine?._id === medicineId);
    if (item) totalUnits += item.quantity || item.qty || 0;
  });
  
  return daysToAnalyze > 0 ? totalUnits / daysToAnalyze : 0;
}

/**
 * Calculate optimal reorder quantity with safety buffer
 * @param {number} avgDailyDemand - Average daily demand
 * @param {number} leadTimeDays - Vendor lead time in days
 * @param {number} safetyStockMultiplier - Buffer (e.g., 1.5 = 50% buffer)
 * @returns {number} Recommended order quantity
 */
export function calculateOptimalReorderQty(avgDailyDemand, leadTimeDays = 7, safetyStockMultiplier = 1.5) {
  const leadTimeDemand = avgDailyDemand * leadTimeDays;
  const safetyBuffer = leadTimeDemand * (safetyStockMultiplier - 1);
  return Math.ceil(leadTimeDemand + safetyBuffer);
}

/**
 * Generate stockout risk score (0-100)
 * @param {number} currentStock
 * @param {number} dailyDemand
 * @param {number} daysUntilDepletion
 * @returns {number} Risk score 0-100
 */
export function calculateStockoutRisk(currentStock, dailyDemand, daysUntilDepletion) {
  if (currentStock <= 0) return 100;
  if (dailyDemand <= 0) return 0;
  
  // Risk increases as days until depletion decreases
  if (daysUntilDepletion <= 0) return 100;
  if (daysUntilDepletion <= 3) return 90;
  if (daysUntilDepletion <= 7) return 70;
  if (daysUntilDepletion <= 14) return 50;
  if (daysUntilDepletion <= 30) return 30;
  return 10;
}

/**
 * Determine alert priority based on urgency
 */
export function getAlertPriority(riskScore, daysUntilDepletion, currentStock) {
  if (currentStock === 0 || daysUntilDepletion <= 0) return ALERT_PRIORITY.CRITICAL;
  if (riskScore >= 90 || daysUntilDepletion <= 2) return ALERT_PRIORITY.CRITICAL;
  if (riskScore >= 70 || daysUntilDepletion <= 7) return ALERT_PRIORITY.HIGH;
  if (riskScore >= 50 || daysUntilDepletion <= 14) return ALERT_PRIORITY.MODERATE;
  return ALERT_PRIORITY.LOW;
}

/**
 * Detect abnormal consumption patterns (adherence insights)
 * Compares actual vs expected consumption
 */
export function detectAdherenceAnomalies(patientOrders, expectedDosagePerDay, medicineId) {
  const anomalies = [];
  const dailyActual = calculateDailyConsumption(patientOrders, medicineId, 30);
  const expectedDaily = expectedDosagePerDay || 1;
  
  const ratio = dailyActual / expectedDaily;
  
  if (ratio < 0.5) {
    anomalies.push({
      type: 'UNDER_ADHERENCE',
      severity: 'high',
      message: `Patient may be missing doses. Actual: ${dailyActual.toFixed(1)}/day vs expected ${expectedDaily}/day`,
      adherenceScore: Math.round(ratio * 100),
    });
  } else if (ratio > 1.5) {
    anomalies.push({
      type: 'OVER_CONSUMPTION',
      severity: 'medium',
      message: `Consumption higher than prescribed. Actual: ${dailyActual.toFixed(1)}/day vs expected ${expectedDaily}/day`,
      adherenceScore: 100,
    });
  }
  
  return anomalies;
}

/**
 * Check for expiring medicines (within 90 days)
 */
export function getExpiringMedicines(medicines, daysThreshold = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysThreshold);
  
  return medicines
    .filter(m => m.expiryDate && new Date(m.expiryDate) <= cutoff && new Date(m.expiryDate) >= new Date())
    .map(m => ({
      ...m,
      daysUntilExpiry: Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

/**
 * Detect slow-moving inventory (no sales in 60+ days)
 */
export function getSlowMovingMedicines(medicines, orderHistory, daysThreshold = 60) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysThreshold);
  
  return medicines.filter(med => {
    const hasRecentSale = orderHistory.some(order => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      if (orderDate < cutoff) return false;
      return order.items?.some(i => i.medicineId === med._id || i.medicine?._id === med._id);
    });
    return !hasRecentSale && med.stock > 0;
  });
}

/**
 * Generate consolidated purchase summary for "Order all refill-needed items"
 */
export function generatePurchaseSummary(medicinesToOrder, vendors) {
  const summary = {
    items: medicinesToOrder.map(m => ({
      medicineId: m._id,
      name: m.name,
      quantity: m.reorderQty || m.quantity || 100,
      unitPrice: m.price || 0,
      totalPrice: (m.reorderQty || m.quantity || 100) * (m.price || 0),
    })),
    totalEstimatedCost: 0,
    vendorRecommendation: vendors[0] || null,
  };
  
  summary.totalEstimatedCost = summary.items.reduce((sum, i) => sum + i.totalPrice, 0);
  return summary;
}

/**
 * Calculate overall system health score
 */
export function calculateSystemHealth(medicines, alerts, expiringCount) {
  const totalMeds = medicines.length;
  const criticalCount = alerts.filter(a => a.priority === ALERT_PRIORITY.CRITICAL).length;
  const highCount = alerts.filter(a => a.priority === ALERT_PRIORITY.HIGH).length;
  const outOfStock = medicines.filter(m => m.stock === 0).length;
  
  let score = 100;
  score -= criticalCount * 15;
  score -= highCount * 5;
  score -= outOfStock * 20;
  score -= expiringCount * 2;
  
  score = Math.max(0, Math.min(100, score));
  
  if (score >= 85) return { score, level: SYSTEM_HEALTH.EXCELLENT };
  if (score >= 70) return { score, level: SYSTEM_HEALTH.GOOD };
  if (score >= 50) return { score, level: SYSTEM_HEALTH.FAIR };
  return { score, level: SYSTEM_HEALTH.POOR };
}

/**
 * Batch low-priority alerts to prevent spam
 * Critical/High: send immediately
 * Moderate/Low: batch and send periodically
 */
export function shouldEscalateImmediately(priority) {
  return priority === ALERT_PRIORITY.CRITICAL || priority === ALERT_PRIORITY.HIGH;
}
