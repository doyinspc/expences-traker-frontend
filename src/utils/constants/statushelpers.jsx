// src/utils/statusHelpers.js

/**
 * Get status object by ID from statuses data
 */
export const getStatusById = (statusesData, id) => {
    if (!statusesData || !Array.isArray(statusesData)) return null;
    return statusesData.find((s) => s.id === id) || null;
};

/**
 * Get status color by ID (from text_1 column)
 */
export const getStatusColor = (statusesData, id) => {
    const status = getStatusById(statusesData, id);
    return status?.text_1 || '#gray';
};

/**
 * Get status name by ID
 */
export const getStatusName = (statusesData, id) => {
    const status = getStatusById(statusesData, id);
    return status?.name || 'Unknown';
};

/**
 * Get status code by ID
 */
export const getStatusCode = (statusesData, id) => {
    const status = getStatusById(statusesData, id);
    return status?.code || null;
};

/**
 * Get status ID by code
 */
export const getStatusIdByCode = (statusesData, code) => {
    if (!statusesData || !Array.isArray(statusesData)) return null;
    const status = statusesData.find((s) => s.code === code);
    return status ? status.id : null;
};

/**
 * Build status ID map from statuses data
 */
export const buildStatusIdMap = (statusesData) => {
    if (!statusesData || !Array.isArray(statusesData)) return {};
    const map = {};
    statusesData.forEach((status) => {
        map[status.code] = status.id;
    });
    return map;
};