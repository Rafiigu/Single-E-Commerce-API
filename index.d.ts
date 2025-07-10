declare namespace Express {
  export interface Request {
    account: {
      id: string;
      role: "admin" | "superadmin" | "staff" | "user";
      email: string;
    };
  }
}
