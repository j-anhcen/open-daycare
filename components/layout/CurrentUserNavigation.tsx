import { currentUser, type StaffUser } from "@/app/_data/mock";
import { getCurrentUserProfile } from "@/lib/dal";
import { MobileMenu } from "./MobileMenu";
import { Sidebar } from "./Sidebar";
import type { NavItemId } from "./Sidebar";

async function getCurrentSidebarUser(): Promise<StaffUser> {
  const { fullName, initial } = await getCurrentUserProfile();

  return { ...currentUser, name: fullName, initial };
}

export async function CurrentUserMobileMenu({
  activeItem,
}: {
  activeItem: NavItemId;
}) {
  const user = await getCurrentSidebarUser();

  return <MobileMenu currentUser={user} activeItem={activeItem} />;
}

export async function CurrentUserSidebar({
  activeItem,
  className,
}: {
  activeItem: NavItemId;
  className?: string;
}) {
  const user = await getCurrentSidebarUser();

  return (
    <Sidebar currentUser={user} activeItem={activeItem} className={className} />
  );
}
