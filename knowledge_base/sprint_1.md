# Sprint: Non-Admin Client View & Final Checks

**Overview**  
We need a new view (page) that displays only the clients belonging to the currently logged-in user’s organization. This is distinct from the admin view, which shows all clients. Additionally, please verify that all the previously outlined changes (profile photo column, users table, dashboard with real data, login flow, etc.) are complete. If any of those tasks were not implemented, please do them now.

---

## Tasks

1. **Verify Previous Changes**  
   - Ensure the following items are already done (and if not, implement them):
     - `profile_photo_url` column added to `clients`  
     - `users` table created (with `organization_id`, `role`, etc.)  
     - Dashboard fetching real data from Supabase  
     - Working login/authentication page  

2. **Create Non-Admin Client View**  
   - Create a new page (e.g., `pages/organizationClients.tsx`) for non-admin users.  
   - When a user navigates here, they should only see clients belonging to their own `organization_id`.  
     - For example:
       ```js
       const { data: clients } = await supabase
         .from('clients')
         .select('*')
         .eq('organization_id', userOrganizationId);
       ```
   - If the user’s `role` is `admin`, redirect them to the admin view (or handle it gracefully).

3. **UI/UX Details**  
   - Display a simple list of clients (names, profile photos, etc.).  
   - Optionally include links or actions specific to each client.  

4. **Testing & Verification**  
   - Log in as a non-admin user and confirm only the clients for that user’s organization are visible.  
   - Log in as an admin and confirm the admin view still shows all clients.  
   - Verify that the login flow, dashboard data, and new client view all function together without errors.

---

## Acceptance Criteria

1. Non-admin users see **only** their organization’s clients in the new view.  
2. Admins maintain full visibility (admin view remains unchanged).  
3. All previous database and UI updates (profile photos, user table, real data dashboard, login) are in place.  
4. No console or runtime errors occur when navigating between the login, dashboard, and client views.

---

**Note to Agent**: Please implement any missing items from the previous instructions before creating this new non-admin client view. If the prior steps are already done, proceed directly with the tasks above.
