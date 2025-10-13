import { NotificationProvider } from "./notification-context.jsx";
import NotificationModal from "./NotificationModal.jsx";

export default function AdminDashboard() {
    return (
        <NotificationProvider>
            <NotificationModal />
            <div>Admin Dashboard</div>
            {/* You can add more components here for the admin dashboard */}
        </NotificationProvider>
    );
}