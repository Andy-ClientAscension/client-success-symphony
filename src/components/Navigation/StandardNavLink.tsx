import { forwardRef } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StandardNavLinkProps extends Omit<NavLinkProps, 'className'> {
  variant?: 'default' | 'sidebar' | 'header' | 'breadcrumb' | 'button';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<any>;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Predefined styles for consistent navigation
const navVariants = {
  default: {
    base: "inline-flex items-center transition-colors hover:text-foreground/80",
    active: "text-foreground",
    inactive: "text-muted-foreground"
  },
  sidebar: {
    base: "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
    active: "bg-primary/10 text-primary font-medium border-r-2 border-primary",
    inactive: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  },
  header: {
    base: "inline-flex items-center px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80",
    active: "text-foreground border-b-2 border-primary",
    inactive: "text-muted-foreground"
  },
  breadcrumb: {
    base: "inline-flex items-center text-sm transition-colors hover:text-foreground",
    active: "text-foreground font-medium",
    inactive: "text-muted-foreground"
  },
  button: {
    base: "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    active: "bg-primary text-primary-foreground hover:bg-primary/90",
    inactive: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  }
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base"
};

export const StandardNavLink = forwardRef<HTMLAnchorElement, StandardNavLinkProps>(
  ({ variant = 'default', size = 'md', icon: Icon, active, className, children, ...props }, ref) => {
    const variantStyles = navVariants[variant];
    
    return (
      <NavLink
        ref={ref}
        className={({ isActive }) => {
          const isLinkActive = active ?? isActive;
          return cn(
            variantStyles.base,
            isLinkActive ? variantStyles.active : variantStyles.inactive,
            variant === 'button' && sizeClasses[size],
            className
          );
        }}
        {...props}
      >
        {Icon && (
          <Icon className={cn(
            "flex-shrink-0",
            variant === 'sidebar' ? "h-5 w-5 mr-3" : "h-4 w-4 mr-2"
          )} />
        )}
        <span className={variant === 'sidebar' ? "text-sm font-medium" : ""}>
          {children}
        </span>
      </NavLink>
    );
  }
);

StandardNavLink.displayName = 'StandardNavLink';

// Pre-configured components for common use cases
export const SidebarNavLink = forwardRef<HTMLAnchorElement, Omit<StandardNavLinkProps, 'variant'>>(
  (props, ref) => <StandardNavLink ref={ref} variant="sidebar" {...props} />
);

export const HeaderNavLink = forwardRef<HTMLAnchorElement, Omit<StandardNavLinkProps, 'variant'>>(
  (props, ref) => <StandardNavLink ref={ref} variant="header" {...props} />
);

export const BreadcrumbNavLink = forwardRef<HTMLAnchorElement, Omit<StandardNavLinkProps, 'variant'>>(
  (props, ref) => <StandardNavLink ref={ref} variant="breadcrumb" {...props} />
);

export const ButtonNavLink = forwardRef<HTMLAnchorElement, Omit<StandardNavLinkProps, 'variant'>>(
  (props, ref) => <StandardNavLink ref={ref} variant="button" {...props} />
);

SidebarNavLink.displayName = 'SidebarNavLink';
HeaderNavLink.displayName = 'HeaderNavLink';
BreadcrumbNavLink.displayName = 'BreadcrumbNavLink';
ButtonNavLink.displayName = 'ButtonNavLink';