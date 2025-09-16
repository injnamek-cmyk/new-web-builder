/*
  Warnings:

  - Added the required column `websiteId` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "subdomain" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Website_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "websiteId" TEXT NOT NULL,
    CONSTRAINT "Page_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Page_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- 기존 페이지의 사용자별로 기본 웹사이트 생성
INSERT INTO "Website" ("id", "name", "description", "subdomain", "isPublished", "createdAt", "updatedAt", "userId")
SELECT
  'default-' || "userId" as "id",
  'My Website' as "name",
  'Default website' as "description",
  'default-' || substr("userId", 1, 8) as "subdomain",
  false as "isPublished",
  datetime('now') as "createdAt",
  datetime('now') as "updatedAt",
  "userId"
FROM (SELECT DISTINCT "userId" FROM "Page");

-- 기존 페이지를 새 테이블로 이동하면서 websiteId 추가
INSERT INTO "new_Page" ("content", "createdAt", "id", "isPublished", "metadata", "path", "title", "updatedAt", "userId", "websiteId")
SELECT
  "content",
  "createdAt",
  "id",
  "isPublished",
  "metadata",
  "path",
  "title",
  "updatedAt",
  "userId",
  'default-' || "userId" as "websiteId"
FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_websiteId_path_key" ON "Page"("websiteId", "path");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Website_subdomain_key" ON "Website"("subdomain");
