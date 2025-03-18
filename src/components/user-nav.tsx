"use client";
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
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

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

      // Get the user data directly from the auth session
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
    // Try all possible avatar locations
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

  return (
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
              {/* <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => router.push("/login")}>
            Sign in
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
