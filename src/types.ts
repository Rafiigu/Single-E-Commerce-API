import { Handler, Router } from "express";
import { PrismaClient } from "../generated/prisma";
import { MailClient } from "./mailer";

export type HandlerWithDeps = (deps: {
  prisma: PrismaClient;
  mailer?: MailClient;
}) => Handler;

export type SetupRoutes = (
  app: Router,
  deps: { prisma: PrismaClient; mailer?: MailClient }
) => void;
