export type Role = "admin" | "superadmin" | "staff" | "user";

export type Payload = {
  id: string;
  role: Role;
  email: string;
};
