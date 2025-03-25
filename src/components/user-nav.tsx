"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Settings, User } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserData {
  id: string;
  email: string | null;
  user_metadata: {
    avatar_url?: string | null;
    picture?: string | null;
    full_name?: string | null;
    name?: string | null;
    email?: string | null;
  };
}

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup listener
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: userData, error } = await supabase.auth.getUser();

      if (error) {
        console.log("Error fetching user:", error);
        setLoading(false);
        return;
      }
      setUser({
        id: userData.user.id,
        email: userData.user.email || "",
        user_metadata: userData.user.user_metadata || {},
      });

      setLoading(false);
    };

    getUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          getUserData();
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const getAvatarUrl = () => {
    return (
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      "/avatars.jpeg"
    );
  };

  const getUsername = () => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      (user?.email ? user.email.split("@")[0] : null) ||
      "User"
    );
  };

  const getInitials = () => {
    const username = getUsername();
    return username
      ? username
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
      : "?";
  };

  // Render for desktop (dropdown)
  const renderDesktopNav = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getAvatarUrl()} alt="Avatar" />
            <AvatarFallback>{loading ? "..." : getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {loading ? (
              <p className="text-sm font-medium leading-none">Loading...</p>
            ) : user ? (
              <>
                <p className="text-sm font-medium leading-none">
                  {getUsername()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium leading-none">Not signed in</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user ? (
          <>
            <DropdownMenuGroup>
              {/* Commented out profile and settings for now */}
              {/* <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => router.push("/login")}>
            <UserIcon className="mr-2 h-4 w-4" />
            Sign in
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Render for mobile (sheet/slide-over)
  const renderMobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getAvatarUrl()} alt="Avatar" />
            <AvatarFallback>{loading ? "..." : getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[540px]">
        <SheetHeader className="mb-4">
          <SheetTitle>Account</SheetTitle>
        </SheetHeader>

        {loading ? (
          <p className="text-sm font-medium leading-none">Loading...</p>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getAvatarUrl()} alt="Avatar" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {getUsername()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Uncomment and modify as needed */}
              {/* <SheetClose asChild>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </SheetClose> */}

              <SheetClose asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </SheetClose>
            </div>
          </div>
        ) : (
          <SheetClose asChild>
            <Button className="w-full" onClick={() => router.push("/login")}>
              <UserIcon className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          </SheetClose>
        )}
      </SheetContent>
    </Sheet>
  );

  // Render based on screen size
  return isMobile ? renderMobileNav() : renderDesktopNav();
}
