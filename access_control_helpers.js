/**
 * Access Control Helpers for Tweet Manager Application
 * 
 * These functions provide application-level access control based on user roles.
 * They should be used in API routes to filter data according to user permissions.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get the user's role and organization
 * @param {string} userId - The user's UUID
 * @returns {Promise<Object>} - User role and organization information
 */
async function getUserInfo(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('role, organization_id')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get clients accessible to the current user
 * @param {string} userId - The user's UUID
 * @returns {Promise<Array>} - List of accessible clients
 */
async function getAccessibleClients(userId) {
  const { role, organization_id } = await getUserInfo(userId);
  
  // Agency admin can see all clients in their organization
  if (role === 'agency_admin') {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organization_id);
    
    if (error) throw error;
    return data;
  } 
  // Agency user can only see their specific client
  else if (role === 'agency_user') {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }
  
  return [];
}

/**
 * Filter content based on user's permissions
 * @param {string} userId - The user's UUID
 * @param {string} contentType - The type of content (tweets, instagram, etc.)
 * @returns {Promise<Array>} - Filtered content items
 */
async function getFilteredContent(userId, contentType) {
  const { role, organization_id } = await getUserInfo(userId);
  let clientIds = [];
  
  // Get the appropriate client IDs based on role
  if (role === 'agency_admin') {
    const { data } = await supabase
      .from('clients')
      .select('client_id')
      .eq('organization_id', organization_id);
    
    clientIds = data.map(client => client.client_id);
  } else if (role === 'agency_user') {
    const { data } = await supabase
      .from('clients')
      .select('client_id')
      .eq('user_id', userId);
    
    clientIds = data.map(client => client.client_id);
  }
  
  // Return empty array if no clients are accessible
  if (clientIds.length === 0) return [];
  
  // Query the content table with the client_id filter
  const { data, error } = await supabase
    .from(contentType)
    .select('*')
    .in('client_id', clientIds);
  
  if (error) throw error;
  return data;
}

/**
 * Check if user has access to a specific client
 * @param {string} userId - The user's UUID
 * @param {string} clientId - The client ID to check access for
 * @returns {Promise<boolean>} - Whether the user has access
 */
async function hasClientAccess(userId, clientId) {
  const { data } = await supabase.rpc('has_client_access', {
    p_user_id: userId,
    p_client_id: clientId
  });
  
  return !!data;
}

/**
 * Middleware to verify client access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function verifyClientAccess(req, res, next) {
  const userId = req.user?.id;
  const clientId = req.params.clientId || req.query.clientId || req.body.clientId;
  
  if (!userId || !clientId) {
    return res.status(400).json({ error: 'Missing user ID or client ID' });
  }
  
  hasClientAccess(userId, clientId)
    .then(hasAccess => {
      if (hasAccess) {
        next();
      } else {
        res.status(403).json({ error: 'Access denied to this client' });
      }
    })
    .catch(error => {
      console.error('Error checking client access:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
}

module.exports = {
  getUserInfo,
  getAccessibleClients,
  getFilteredContent,
  hasClientAccess,
  verifyClientAccess
}; 