"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, Shield } from "lucide-react"

export default function Header() {
  const { user, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const closeSheet = () => setIsOpen(false)

  const userLinks = user
    ? user.role === "admin"
      ? [
        { href: "/admin/dashboard", label: ("Dashboard") },
        { href: "/admin/employers", label: ("Employers") },
      ]
      : user.role.toLocaleLowerCase() === "student"
        ? [
          { href: "/student/dashboard", label: ("Dashboard") },
          { href: "/student/profile", label: ("Profile") },
          { href: "/student/applications", label: ("Applications") },
        ]
        : [
          { href: "/employer/dashboard", label: ("Dashboard") },
          { href: "/employer/jobs", label: ("Jobs") },
          { href: "/employer/profile", label: ("Profile") },
        ]
    : []

  return (
    <header className="m-8 border-b rounded-full sticky top-0 z-40 bg-[#193538]">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-20">
          <Link href="/" className="flex gap-2 text-xl font-bold mr-8">
            <svg width="39" height="30" viewBox="0 0 49 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.3947 40C43.8275 39.8689 49 34.6073 49 28.1389C49 24.9931 47.7512 21.9762 45.5282 19.7518L25.7895 0V12.2771C25.7895 14.3303 26.6046 16.2995 28.0556 17.7514L32.6795 22.3784L32.6921 22.3907L40.4452 30.149C40.697 30.4009 40.697 30.8094 40.4452 31.0613C40.1935 31.3133 39.7852 31.3133 39.5335 31.0613L36.861 28.3871H12.139L9.46655 31.0613C9.21476 31.3133 8.80654 31.3133 8.55476 31.0613C8.30297 30.8094 8.30297 30.4009 8.55475 30.149L16.3079 22.3907L16.3205 22.3784L20.9444 17.7514C22.3954 16.2995 23.2105 14.3303 23.2105 12.2771V0L3.47175 19.7518C1.24882 21.9762 0 24.9931 0 28.1389C0 34.6073 5.17252 39.8689 11.6053 40H37.3947Z" fill="#FF0A0A"></path>
            </svg>
            <span className="text-2xl">ShiftLink</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
              {("Jobs")}
            </Link>
            <Link href="/employers" className="text-muted-foreground hover:text-foreground transition-colors">
              For Employers
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-8">
          <ModeToggle />

          {isLoading ? (
            <div className="h-10 w-20 rounded-md bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="gap-2">
                  {user.role === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span className="hidden sm:inline-block">
                    {user.isPremium && user.role === "student" ? (
                      <span className="flex items-center">
                        Account
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                          Premium
                        </span>
                      </span>
                    ) : user.role === "admin" ? (
                      "Admin"
                    ) : (
                      (user.name ||"Profile")
                    )}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">{user.name || user.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {userLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/login">login</Link>
              </Button>
              <Button asChild>
                <Link href="/register/student">signup</Link>
              </Button>
            </div>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/jobs" className="py-2" onClick={closeSheet}>
                  jobs
                </Link>
                <Link href="/employers" className="py-2" onClick={closeSheet}>
                  For Employers
                </Link>
                <Link href="/about" className="py-2" onClick={closeSheet}>
                  About Us
                </Link>

                <div className="h-px bg-border my-4" />

                {user ? (
                  <>
                    {userLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="py-2" onClick={closeSheet}>
                        {link.label}
                      </Link>
                    ))}
                    <Button
                      variant="destructive"
                      className="mt-4"
                      onClick={() => {
                        logout()
                        closeSheet()
                      }}
                    >
                      logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login" onClick={closeSheet}>
                        login
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register/student" onClick={closeSheet}>
                        signup
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
