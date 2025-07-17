declare namespace Express {
  export interface Request {
    parsedQuery: Record<string, string>;
    account: {
      id: string;
      role: "admin" | "superadmin" | "staff" | "user";
      email: string;
    };
  }
}
