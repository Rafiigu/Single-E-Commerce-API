import multer from "multer";
import path from "path";
import { ENV } from "./env";
import { nanoid } from "nanoid";
import { createFieldError } from "./error";
import { StatusCodes } from "http-status-codes";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(process.cwd(), ENV.FILE_DIRECTORY));
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const filename = path.parse(file.originalname).name;

    callback(null, `${nanoid(10)}_${filename}${ext}`);
  },
});

const ALLOWED_EXTENSIONS = [".png", ".jpeg", ".jpg"];

export const uploadFiles = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);

    if (!ALLOWED_EXTENSIONS.find((v) => v === ext)) {
      return callback(
        createFieldError(StatusCodes.BAD_REQUEST, {
          fileName: "File harus .png, .jpeg, atau .jpg",
        })
      );
    }

    return callback(null, true);
  },
}).array("files", 7);

export const getFilePath = (filename: string) => {
  const filePath = path.join(process.cwd(), "data", filename);
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  return null;
};
