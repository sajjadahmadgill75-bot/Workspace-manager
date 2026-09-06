import { useAppSelector } from '../store';
import { SystemRole } from '../types/workspace';

const ROLE_HIERARCHY: Record<SystemRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
  viewer: 0,
};

interface PermissionOptions {
  projectId?: string;
  requireLead?: boolean; // If true, requires the user to specifically be the project lead or owner
}

export function usePermission(requiredRole: SystemRole, options?: PermissionOptions) {
  const { activeUserId, users } = useAppSelector((state) => state.auth);
  const { projects } = useAppSelector((state) => state.project);

  const activeUser = users.find((u) => u.id === activeUserId);
  
  if (!activeUser) return false;

  const userRoleLevel = ROLE_HIERARCHY[activeUser.systemRole];
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];

  // Owner always has permission
  if (activeUser.systemRole === 'owner') return true;

  // Project Lead Check (if projectId is provided)
  let isProjectLead = false;
  if (options?.projectId) {
    const project = projects.find((p) => p.id === options.projectId);
    if (project && project.leadId === activeUserId) {
      isProjectLead = true;
    }
  }

  // If requireLead is strict, they must be the lead (or owner, handled above)
  if (options?.requireLead) {
    return isProjectLead;
  }

  // If they are project lead, they act as an 'admin' for that project
  if (isProjectLead && requiredRoleLevel <= ROLE_HIERARCHY.admin) {
    return true;
  }

  // Fallback to standard system role comparison
  return userRoleLevel >= requiredRoleLevel;
}
