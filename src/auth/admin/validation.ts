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
