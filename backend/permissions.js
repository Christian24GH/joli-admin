export const DEPARTMENT_PERMISSIONS = {
  HR: ["view_hr", "edit_hr", "manage_hr"],
  Core: ["view_core", "edit_core", "manage_core"],
  Logistics: ["view_logistics", "edit_logistics", "manage_logistics"],
  Administrative: ["view_admin", "edit_admin", "manage_admin"],
  Financials: ["view_financials", "edit_financials", "manage_financials"],
};

export const ROLE_PERMISSIONS = {
  admin: [
    ...DEPARTMENT_PERMISSIONS.HR,
    ...DEPARTMENT_PERMISSIONS.Core,
    ...DEPARTMENT_PERMISSIONS.Logistics,
    ...DEPARTMENT_PERMISSIONS.Administrative,
    ...DEPARTMENT_PERMISSIONS.Financials,
  ],
  hr_manager: DEPARTMENT_PERMISSIONS.HR,
  finance_manager: DEPARTMENT_PERMISSIONS.Financials,
  logistics_staff: DEPARTMENT_PERMISSIONS.Logistics,
  admin_staff: DEPARTMENT_PERMISSIONS.Administrative,
  core_staff: DEPARTMENT_PERMISSIONS.Core,
  customer: [],
  tour_guide: [],
  agent: [],
};