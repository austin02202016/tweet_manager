# Sprint: Fix Organization ID Handling in Authentication Flow

**Overview:**  
The authentication flow is not storing the user's `organization_id`, resulting in null values and causing incorrect data displays. The goal of this sprint is to ensure that when a user logs in, their associated `organization_id` is properly captured, stored in our custom `users` table, and then used for organization-specific data queries.

---

## Tasks

1. **Review and Update Authentication Flow**
   - Inspect the authentication code (e.g., in `pages/login.tsx` or your auth handler) to verify that the `organization_id` is being captured during user creation or login.
   - Confirm that the signup/login process retrieves or accepts an `organization_id` (e.g., from Supabase Auth metadata, a custom form field, or another source).
   - Update the logic so that the `organization_id` is included in the data written to the custom `users` table.

2. **Update the Users Table Logic**
   - Ensure that when inserting a new record into `public.users`, the query includes the `organization_id` field.
   - Verify the mapping between the authenticated user (`auth_user_id`) and their `organization_id` is correctly implemented.
   - If needed, modify the SQL or API code responsible for creating/updating user records so that it properly sets the `organization_id`.

3. **Test and Verify Data Flow**
   - After login, run a query like the following to confirm the user record contains a valid `organization_id`:
     ```sql
     SELECT * FROM public.users WHERE auth_user_id = '<logged-in user id>';
     ```
   - Log in with a user account that should have a known organization, and check that the dashboard or subsequent pages display data filtered by the correct `organization_id`.

4. **Implement Error Handling and Logging**
   - Add logging or error notifications in the authentication flow to capture cases where `organization_id` remains null.
   - Provide clear feedback if required information (such as the organization id) is missing during the signup process.

5. **Verify Organization-Specific Data Display**
   - Update any queries or UI components that load organization-specific data to use the stored `organization_id`. For example, when fetching clients:
     ```js
     const { data: clients } = await supabase
       .from('clients')
       .select('*')
       .eq('organization_id', user.organization_id);
     ```
   - Ensure that non-admin users only see data related to their organization.

6. **Final End-to-End Testing**
   - Confirm that after authentication:
     - The user record in `public.users` has a valid, non-null `organization_id`.
     - The dashboard and other pages display the correct organization-specific data.
     - Both non-admin and admin flows function as expected.

---

**Note to Agent:**  
If any previous changes (like the setup of the custom `users` table, the addition of the `profile_photo_url` column, or the real data dashboard) are not complete, please address those issues as part of this sprint.
