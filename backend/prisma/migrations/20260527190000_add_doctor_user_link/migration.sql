ALTER TABLE "Doctor" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");
