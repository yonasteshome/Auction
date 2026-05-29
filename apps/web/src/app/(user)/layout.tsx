import { UserAppShell } from "@/components/user-app-shell";

type UserShellLayoutProps = {
  children: React.ReactNode;
};

export default function UserShellLayout({ children }: UserShellLayoutProps) {
  return <UserAppShell>{children}</UserAppShell>;
}
