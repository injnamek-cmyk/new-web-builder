/*
  Warnings:

  - Added the required column `metadata` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Page` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Page_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Page" ("content", "createdAt", "id", "title", "path", "metadata", "updatedAt", "userId")
SELECT
  "content",
  "createdAt",
  "id",
  COALESCE("title", 'Untitled Page') as "title",
  '/page-' || "id" as "path",
  '{"title":"' || COALESCE("title", 'Untitled Page') || '"}' as "metadata",
  "updatedAt",
  "userId"
FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_path_key" ON "Page"("path");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
