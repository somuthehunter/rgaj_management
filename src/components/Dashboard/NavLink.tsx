"use client";

import { forwardRef, type AnchorHTMLAttributes } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className"> {
  to: LinkProps["href"];
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  exact?: boolean;
  prefetch?: LinkProps["prefetch"];
  replace?: LinkProps["replace"];
  scroll?: LinkProps["scroll"];
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    {
      className,
      activeClassName,
      pendingClassName: _pendingClassName,
      to,
      exact = false,
      ...props
    },
    ref,
  ) => {
    const pathname = usePathname();
    const targetPath =
      typeof to === "string" ? to : (to.pathname?.toString() ?? "");
    const isActive = exact
      ? pathname === targetPath
      : pathname === targetPath ||
        (targetPath !== "/" && pathname.startsWith(`${targetPath}/`));

    return (
      <Link
        ref={ref}
        href={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
