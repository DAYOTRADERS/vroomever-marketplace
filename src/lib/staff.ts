export const STAFF_ROLES = ["customer_care", "secretary"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const staffHome: Record<StaffRole, "/customeradmin" | "/secretaryadmin"> = {
  customer_care: "/customeradmin",
  secretary: "/secretaryadmin",
};

export const staffLabel: Record<StaffRole, string> = {
  customer_care: "Customer care",
  secretary: "Secretary",
};

/** A staff page accepts only its own role; admins and other roles are refused. */
export function canOpenStaffPage(page: StaffRole, role: string | null | undefined): boolean {
  return role === page;
}
