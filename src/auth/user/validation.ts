import { z } from "zod";

export const registerBodySchema = z.object({
  name: z
    .string({ required_error: "Nama tidak boleh kosong." })
    .min(3, "Nama lengkap minimal 3 karakter."),
  email: z.string().email("Format email tidak benar.").trim(),
  password: z
    .string()
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password harus memiliki minimum 8 karakter, minimal satu huruf kapital, minimal satu huruf kecil, minimal satu angka, dan satu karakter khusus"
    ),
});

export const loginBodySchema = z.object({
  email: z.string().email("Format email tidak benar.").trim(),
  password: z
    .string()
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password harus memiliki minimum 8 karakter, minimal satu huruf kapital, minimal satu huruf kecil, minimal satu angka, dan satu karakter khusus"
    ),
});
