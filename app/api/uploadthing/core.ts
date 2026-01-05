import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth/config";
import { logger } from "@/lib/utils/logger";

// Uploadthing puede usar UPLOADTHING_TOKEN o UPLOADTHING_SECRET
const uploadthingToken =
  process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET;

if (!uploadthingToken) {
  logger.error(
    "UPLOADTHING_TOKEN o UPLOADTHING_SECRET no está configurado en las variables de entorno"
  );
}

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth();

      if (!session) {
        throw new Error("No autorizado");
      }

      return { userId: session.user?.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Image upload complete", {
        userId: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
      });

      return { uploadedBy: metadata.userId, url: file.url };
    }),

  videoUploader: f({ video: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth();

      if (!session) {
        throw new Error("No autorizado");
      }

      return { userId: session.user?.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Video upload complete", {
        userId: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
      });

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

