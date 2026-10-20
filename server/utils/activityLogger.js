const ActivityLog = require("../models/ActivityLog");

/**
 * Log an activity to the database
 * @param {Object} params
 * @param {string} params.userId - The user performing the action
 * @param {string} params.action - Action code e.g. "PRODUCT_CREATED"
 * @param {string} params.entityType - e.g. "Product"
 * @param {string} params.entityId - ObjectId of the affected document
 * @param {string} params.description - Human-readable description
 */
const logActivity = async ({ userId, action, entityType, entityId, description }) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      entityType,
      entityId,
      description,
    });
  } catch (err) {
    // Don't let activity logging failures break the main operation
    console.error("Activity log error:", err.message);
  }
};

module.exports = { logActivity };
