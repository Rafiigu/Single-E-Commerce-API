import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

console.log({
  id: nanoid(),
  email: "superadmin@gmail.com",
  password: bcrypt.hashSync("Superadmin123", bcrypt.genSaltSync(10)),
});
