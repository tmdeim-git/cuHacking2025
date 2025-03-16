import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { useSignOut } from "@gadgetinc/react";
import { Home, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import {
  Link,
  Outlet,
  redirect,
  useLocation,
  useOutletContext,
} from "react-router";
import type { RootOutletContext } from "../root";
import type { Route } from "./+types/_user";
import Logo from "@/assets/logo.png";

export const loader = async ({ context }: Route.LoaderArgs) => {
  const { session, gadgetConfig } = context;

  const userId = session?.get("user");

  let user;
  try {
    user = userId ? await context.api.user.findOne(userId) : undefined;
  } catch (error) {
    // Handle the case where findOne throws an error (user not found in database)
    context.logger?.info(`Error fetching user: ${error}`);
    return redirect(gadgetConfig.authentication!.signInPath);
  }

  if (!user) {
    return redirect(gadgetConfig.authentication!.signInPath);
  }

  return {
    user,
  };
};

export type AuthOutletContext = RootOutletContext & {
  user?: any;
};

const UserMenu = ({ user }: { user: any }) => {
  const [userMenuActive, setUserMenuActive] = useState(false);
  const signOut = useSignOut();

  const getInitials = () => {
    return (
      (user.firstName?.slice(0, 1) ?? "") + (user.lastName?.slice(0, 1) ?? "")
    ).toUpperCase();
  };

  return (
    <DropdownMenu open={userMenuActive} onOpenChange={setUserMenuActive}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 hover:bg-accent">
          {`Welcome to QuickPulse ${user.firstName}`}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={signOut}
          className="flex items-center text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SideBar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col flex-grow bg-background border-r h-full">
      <img src={Logo} className="h-12 w-12" />
    </div>
  );
};

const SideBarMenuButtonDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="md:hidden" // Only show on slim screen
    >
      <img src={Logo} className="h-12 w-12" />
    </div>
  );
};

export default function ({ loaderData }: Route.ComponentProps) {
  const user = "user" in loaderData ? loaderData.user : undefined;
  const rootOutletContext = useOutletContext<RootOutletContext>();

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <SideBar />
      </div>
      <div className="flex-1 flex flex-col md:pl-64">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-background">
          <SideBarMenuButtonDrawer />
          <div className="ml-auto">
            <UserMenu user={user} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet
              context={{ ...rootOutletContext, user } as AuthOutletContext}
            />
            <Toaster richColors />
          </div>
        </main>
      </div>
    </div>
  );
}
