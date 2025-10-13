import {
  Car,
  Command,
  LifeBuoy,
  ScaleIcon,
  PieChartIcon,
  Send,
  WrenchIcon,
  BookOpenCheckIcon,
  Gauge,
  ChartSpline,
  User,
  TagsIcon,
  HistoryIcon,
  LogsIcon,
  MapPinIcon,
  GlobeIcon,
  FilesIcon,
  HotelIcon,
  IdCardLanyardIcon,
  ContrastIcon,
  ListCheckIcon,
  SquareActivityIcon,
  MessageCircleCodeIcon,
  MessageCircleMoreIcon,
  DollarSign,
  Calendar
} from "lucide-react"

import { Link } from 'react-router'
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Skeleton } from '@/components/ui/skeleton'

import AuthContext from "../context/AuthProvider"
import { useContext } from "react"

import logo from '@/assets/joli_cropped.png'
const data = {
  adminNav: [
    {
      NavGroup: {
        NavLabel: 'Administration',
        NavItems: [
          { title: 'Dashboard', url: '/', icon: Gauge },
          { title: 'Document Management', url: '/document-management', icon: FilesIcon },
          { title: 'Notification Context', url: '/notification-context', icon: MessageCircleMoreIcon },
          { title: 'Notification Modal', url: '/notification-modal', icon: MessageCircleMoreIcon },
          { title: 'Role & Permission Management', url: '/role-permission-management', icon: TagsIcon },
          { title: 'User Authentication', url: '/user-auth', icon: User },
          { title: 'User Groups & Hierarchy', url: '/user-groups-hierarchy', icon: ListCheckIcon },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'Legal',
        NavItems: [
          { title: 'Dashboard', url: '/legal', icon: ScaleIcon },
          { title: 'Cases', url: '/legal/cases', icon: ScaleIcon },
          { title: 'Contracts', url: '/legal/contracts', icon: ContrastIcon },
          { title: 'Documents', url: '/legal/documents', icon: FilesIcon },
          { title: 'Compliance', url: '/legal/compliance', icon: SquareActivityIcon },
          { title: 'Tasks', url: '/legal/tasks', icon: ListCheckIcon },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'Facilities',
        NavItems: [
          { title: 'Approval', url: '/facility/approval', icon: ScaleIcon },
          { title: 'Catalog', url: '/facility/catalog', icon: BookOpenCheckIcon },
          { title: 'Documents', url: '/facility/document', icon: FilesIcon },
          { title: 'Reservation', url: '/facility/reservation', icon: BookOpenCheckIcon },
          { title: 'Payment', url: '/facility/payment', icon: DollarSign },
          { title: 'Report', url: '/facility/report', icon: PieChartIcon },
          { title: 'Reservation List', url: '/facility/reservation-list', icon: ListCheckIcon },
          { title: 'Scheduling', url: '/facility/scheduling', icon: Calendar },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'User Management',
        NavItems: [
          { title: 'Accounts', url: '/user/accounts', icon: User },
          { title: 'Activity Logs', url: '/user/activity-log', icon: HistoryIcon },
          { title: 'Groups & Hierarchy', url: '/user/groups', icon: ListCheckIcon },
          { title: 'Notifications', url: '/user/notification', icon: MessageCircleMoreIcon },
          { title: 'Profile & Preferences', url: '/user/profile', icon: IdCardLanyardIcon },
          { title: 'Roles & Permissions', url: '/user/role-permission', icon: TagsIcon },
          { title: 'Security', url: '/user/security', icon: WrenchIcon },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'People',
        NavItems: [
          { title: 'Visitor Management', url: '/visitor', icon: IdCardLanyardIcon },
        ],
      },
    },
  ],


  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  
}
export function AppSidebar({ ...props }) {
  const { auth, logout, loading } = useContext(AuthContext)
  const user = {
    name: auth?.name,
    role: auth?.role,
    avatar: null,
    email: auth?.email
  }

  return (
    <Sidebar collapsible="icon" {...props} className="rounded-md">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>            
            <Link to="/" className="flex justify-center">
              <img src={logo} className="h-10  object-scale-down" alt=""/>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2">

        {loading ? (
            // Skeleton Placeholder while loading
            <div className="flex flex-col gap-2 px-2 h-full">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="flex-1 w-full" />
              <Skeleton className="flex-1 w-full" />
            </div>
          ) : (
            <>
            <NavMain data={data.adminNav}/>
          </>
        )
        }
      </SidebarContent>
      <SidebarRail/>
      <SidebarFooter>
        {loading ?
          (<Skeleton className="w-full h-full" />) : (<NavUser user={user} logout={logout} />)
        }
      </SidebarFooter>
    </Sidebar>
  );
}

