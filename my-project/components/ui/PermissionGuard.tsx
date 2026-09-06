import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import { SystemRole } from '../../types/workspace';

interface PermissionGuardProps {
  requiredRole: SystemRole;
  projectId?: string;
  requireLead?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  disabledMode?: boolean;
}

export function PermissionGuard({
  requiredRole,
  projectId,
  requireLead,
  children,
  fallback = null,
  disabledMode = false,
}: PermissionGuardProps) {
  const hasPermission = usePermission(requiredRole, { projectId, requireLead });

  if (hasPermission) {
    return <>{children}</>;
  }

  if (disabledMode) {
    // If it's a single React element, we can clone it and add disabled prop
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        // @ts-ignore - we are forcefully injecting disabled and pointer-events-none classes
        disabled: true,
        className: `${(children as any).props.className || ''} opacity-50 cursor-not-allowed pointer-events-none`.trim(),
        title: "You do not have permission to perform this action.",
      });
    }
    
    // Fallback if it's not a single valid element (like text or fragments)
    return (
      <div className="opacity-50 cursor-not-allowed" title="You do not have permission to perform this action.">
        {children}
      </div>
    );
  }

  return <>{fallback}</>;
}
