import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import React from 'react';
import { createRoot } from 'react-dom/client'

// Using the alias to maintain backward compatibility
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from './context/AuthProvider.jsx';
import { ThemeProvider } from "./context/theme-provider"
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';
import NotFound from './main/not-found';


//ADD ADMIN IMPORTS HERE
import AdministrativeDashboard from './administrative/dashboard'
import DocumentManagement from './administrative/document-management'
import { NotificationContext } from './administrative/notification-context'
import NotificationModal from './administrative/NotificationModal'
import RolePermissionManagement from './administrative/role-permission-management'
import UserAuth from './administrative/user-auth'
import UserGroupsHierarchy from './administrative/user-groups-hierarchy'

/* Facility */
import FacilityApproval from './administrative/Facility/Approval'
import FacilityCatalog from './administrative/Facility/Catalog'
import FacilityDocument from './administrative/Facility/Document'
import FacilityReservation from './administrative/Facility/facility-reservation'
import FacilityPayment from './administrative/Facility/Payment'
import FacilityReport from './administrative/Facility/Report'
import FacilityReservationList from './administrative/Facility/Reservation'
import FacilityScheduling from './administrative/Facility/Scheduling'

/* Legal */
import LegalDashboard from './administrative/Legal/Legal-Dashboard'
import LegalCases from './administrative/Legal/LegalTabs/Cases'
import LegalCompliance from './administrative/Legal/LegalTabs/Compliance'
import LegalContracts from './administrative/Legal/LegalTabs/Contracts'
import LegalDocuments from './administrative/Legal/LegalTabs/Documents'
import LegalTasks from './administrative/Legal/LegalTabs/Tasks'

/* User */
import UserAccounts from './administrative/User/Accounts'
import UserActivityLog from './administrative/User/ActivityLog'
import UserGroups from './administrative/User/Groups'
import UserNotification from './administrative/User/Notification'
import UserProfile from './administrative/User/Profile'
import UserRolePermission from './administrative/User/RolePermission'
import UserSecurity from './administrative/User/Security'
import UserManagement from './administrative/User/user-management'
import UserFilter from './administrative/User/components/UserFilter'
import UserForm from './administrative/User/components/UserForm'
import UserStats from './administrative/User/components/UserStats'
import UserTable from './administrative/User/components/UserTable'

/* Visitor */
import VisitorManagement from './administrative/Visitor/visitor-management.jsx'
//console.log('app: src/main.jsx loaded'); 
const baseUrl = import.meta.env.VITE_BASE_URL

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <Toaster richColors />
        <Routes>
          {/**ADMINISTRATIVE */}
          <Route
            path="/"
            element={
              <Layout
                allowedRoles={[
                  'Facility Admin',
                  'Legal Admin',
                  'Front Desk Admin',
                  'Super Admin',
                ]}
              />
            }
          >
            {/* Administration */}
            <Route index element={<AdministrativeDashboard />} />
            <Route path="document-management" element={<DocumentManagement />} />
            <Route path="notification-context" element={<NotificationContext />} />
            <Route path="notification-modal" element={<NotificationModal />} />
            <Route path="role-permission-management" element={<RolePermissionManagement />} />
            <Route path="user-auth" element={<UserAuth />} />
            <Route path="user-groups-hierarchy" element={<UserGroupsHierarchy />} />

            {/* Legal */}
            <Route path="legal">
              <Route index element={<LegalDashboard />} />
              <Route path="cases" element={<LegalCases />} />
              <Route path="contracts" element={<LegalContracts />} />
              <Route path="documents" element={<LegalDocuments />} />
              <Route path="compliance" element={<LegalCompliance />} />
              <Route path="tasks" element={<LegalTasks />} />
            </Route>

            {/* Facilities */}
            <Route path="facility">
              <Route path="approval" element={<FacilityApproval />} />
              <Route path="catalog" element={<FacilityCatalog />} />
              <Route path="document" element={<FacilityDocument />} />
              <Route path="reservation" element={<FacilityReservation />} />
              <Route path="payment" element={<FacilityPayment />} />
              <Route path="report" element={<FacilityReport />} />
              <Route path="reservation-list" element={<FacilityReservationList />} />
              <Route path="scheduling" element={<FacilityScheduling />} />
            </Route>

            {/* User */}
            <Route path="user">
              <Route index element={<UserManagement />} />
              <Route path="accounts" element={<UserAccounts />} />
              <Route path="activity-log" element={<UserActivityLog />} />
              <Route path="groups" element={<UserGroups />} />
              <Route path="notification" element={<UserNotification />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="role-permission" element={<UserRolePermission />} />
              <Route path="security" element={<UserSecurity />} />

              <Route path="components">
                <Route path="user-filter" element={<UserFilter />} />
                <Route path="user-form" element={<UserForm />} />
                <Route path="user-stats" element={<UserStats />} />
                <Route path="user-table" element={<UserTable />} />
              </Route>
            </Route>

            {/* Visitor */}
            <Route path="visitor">
              <Route index element={<VisitorManagement />} />
            </Route>
          </Route>


          {/**NOT FOUND PAGE AS LAST CHILD OF ROUTES */}
          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);


