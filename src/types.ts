import { Handler, Router } from "express";
import { PrismaClient } from "../generated/prisma";

export type HandlerWithDeps = (prisma: PrismaClient) => Handler;
export type SetupRoutes = (app: Router, prisma: PrismaClient) => void;
