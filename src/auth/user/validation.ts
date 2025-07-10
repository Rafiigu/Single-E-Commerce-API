import { z } from "zod";

export const registerBodySchema = z.object({
  name: z
    .string({ required_error: "Nama tidak boleh kosong." })
    .min(3, "Nama lengkap minimal 3 karakter."),
  email: z.string().trim().email("Format email tidak benar."),
  password: z
    .string()
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password harus memiliki minimum 8 karakter, minimal satu huruf kapital, minimal satu huruf kecil, minimal satu angka, dan satu karakter khusus"
    ),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email("Format email tidak benar."),
  password: z
    .string()
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password harus memiliki minimum 8 karakter, minimal satu huruf kapital, minimal satu huruf kecil, minimal satu angka, dan satu karakter khusus"
    ),
});

export const verifyBodySchema = z.object({
  email: z.string().trim().email("Format email tidak benar."),
  token: z.string().min(1, "Token harus diisi"),
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email("Format email tidak benar."),
});

export const resetPasswordBodySchema = z.object({
  email: z.string().trim().email("Format email tidak benar."),
  token: z.string().min(1, "Token harus diisi"),
  newPassword: z
    .string()
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password harus memiliki minimum 8 karakter, minimal satu huruf kapital, minimal satu huruf kecil, minimal satu angka, dan satu karakter khusus"
    ),
});

export const updatePasswordBodySchema = z.object({
  email: z.string().trim().email("Format email tidak benar."),
  currentPassword: z
    .string()
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password harus memiliki minimum 8 karakter, minimal satu huruf kapital, minimal satu huruf kecil, minimal satu angka, dan satu karakter khusus"
    ),
  newPassword: z
    .string()
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password harus memiliki minimum 8 karakter, minimal satu huruf kapital, minimal satu huruf kecil, minimal satu angka, dan satu karakter khusus"
    ),
});
