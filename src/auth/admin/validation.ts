import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().trim().email("Format email tidak benar."),
  password: z.string(),
});

export const updateProfileBodySchema = z.object({
  name: z
    .string({
      required_error: "Nama tidak boleh kosong.",
      invalid_type_error: "Nama harus berupa teks.",
    })
    .trim()
    .min(2, "Nama harus memiliki minimal 2 karakter."),
});

export const updatePasswordBodySchema = z.object({
  currentPassword: z.string({
    required_error: "Password lama tidak boleh kosong.",
    invalid_type_error: "Password lama harus berupa teks.",
  }),
  newPassword: z
    .string({
      required_error: "Password baru tidak boleh kosong.",
      invalid_type_error: "Password baru harus berupa teks.",
    })
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password baru harus memiliki minimum 8 karakter, minimal satu huruf kapital, minimal satu huruf kecil, minimal satu angka, dan satu karakter khusus"
    ),
});
