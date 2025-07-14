"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "lib/utils"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Lock, Search, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Sparkles } from 'lucide-react';
import { useAuth } from "@/components/auth/auth-context";

export function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="px-2 py-3 sm:px-4 w-full border-b border-border">

      <div className="container flex gap-4 flex-wrap items-center justify-around md:justify-between mx-auto">

        <Link href="/" className="flex items-center">
          <Button variant="link" className="[&_svg]:size-8 stroke">
            <Sparkles size={30} strokeWidth={1.2} /> <span className="self-center text-2xl font-semibold whitespace-nowrap">lhBlog</span>
          </Button>
        </Link>

        <NavigationMenu >
          <NavigationMenuList>

            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Contact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {isAuthenticated && (
              <NavigationMenuItem>
                <Link href="/own-blog" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Own Blog
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}

          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex flex-row ">
          <Link href={"/search"}>
            <Button variant="link"> <Search /> </Button>
          </Link>
          {isAuthenticated ? (
            <Button variant="link" onClick={logout}> <LogOut /> Logout </Button>
          ) : (
            <Link href={"/auth/signin"}>
              <Button variant="link"> <Lock /> Login </Button>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
