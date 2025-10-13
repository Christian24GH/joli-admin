import { ROLE_PERMISSIONS } from "./permissions.js";

export function requirePermission(permission) {
  return (req, res, next) => {
    const user = req.user; // Assume user is set by authentication middleware
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const allowed = (user.permissions || []).includes(permission) ||
      (ROLE_PERMISSIONS[user.role] || []).includes(permission);

    if (!allowed) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}