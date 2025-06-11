import { Application, Handler } from "express";
import { PrismaClient } from "../generated/prisma";

export type HandlerWithDeps = (prisma: PrismaClient) => Handler;
export type SetupRoutes = (app: Application, prisma: PrismaClient) => void;
