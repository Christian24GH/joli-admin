const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost/TravelAndTours/Administrative/api';
console.log('[API_BASE]', API_BASE);

/**
 * Lightweight fetch wrapper that returns JSON or throws.
 */
async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  console.log('[API request]', url);
  const res = await fetch(url, {
    credentials: "same-origin",
    ...opts,
    headers: {
      Accept: "application/json",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    // include server body in error for debugging
    throw new Error(text || `Request failed: ${res.status} ${res.statusText}`);
  }

  // try parse JSON, show raw body on parse error
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error(`Invalid JSON response from ${url} — response body:\n${text}`);
  }
}

/* Users endpoints */
export function fetchUsers() {
  return request("/users.php", { method: "GET" });
}
export function createUser(payload) {
  return request("/users.php", { method: "POST", body: JSON.stringify(payload) });
}
export function updateUser(id, payload) {
  return request(`/users.php?id=${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}
export function deleteUser(id) {
  return request(`/users.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

/* Groups endpoints */
export function fetchGroups() {
  return request("/groups.php", { method: "GET" });
}
export function createGroup(payload) {
  return request("/groups.php", { method: "POST", body: JSON.stringify(payload) });
}
export function deleteGroup(id) {
  return request(`/groups.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

/* Group members endpoints */
export function fetchGroupMembers() {
  return request("/group_members.php", { method: "GET" });
}
export function addGroupMember(group_id, user_id) {
  return request("/group_members.php", {
    method: "POST",
    body: JSON.stringify({ group_id, user_id }),
  });
}
export function removeGroupMember(group_id, user_id) {
  return request(
    `/group_members.php?group_id=${encodeURIComponent(group_id)}&user_id=${encodeURIComponent(user_id)}`,
    { method: "DELETE" }
  );
}

/* Convenience loader */
export async function loadAllGroupsData() {
  const [groups, users, members] = await Promise.all([
    fetchGroups(),
    fetchUsers(),
    fetchGroupMembers(),
  ]);
  return { groups: groups || [], users: users || [], members: members || [] };
}