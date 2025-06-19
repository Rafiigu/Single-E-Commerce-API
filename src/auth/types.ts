export type Role = "admin" | "superadmin" | "user";

export type Payload = {
  id: string;
  role: Role;
  email: string;
};
