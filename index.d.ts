declare namespace Express {
  export interface Request {
    account: {
      id: string;
      role: "admin" | "superadmin" | "user";
      email: string;
    };
  }
}
