/*
  Warnings:

  - Added the required column `role` to the `BoardPresence` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[BoardPresence] DROP CONSTRAINT [BoardPresence_lastSeen_df],
[BoardPresence_online_df];
ALTER TABLE [dbo].[BoardPresence] ADD CONSTRAINT [BoardPresence_online_df] DEFAULT 0 FOR [online];
ALTER TABLE [dbo].[BoardPresence] ADD [role] NVARCHAR(1000) NOT NULL;

-- CreateIndex
CREATE NONCLUSTERED INDEX [BoardPresence_boardId_idx] ON [dbo].[BoardPresence]([boardId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [BoardPresence_email_idx] ON [dbo].[BoardPresence]([email]);

-- AddForeignKey
ALTER TABLE [dbo].[BoardPresence] ADD CONSTRAINT [BoardPresence_boardId_fkey] FOREIGN KEY ([boardId]) REFERENCES [dbo].[Board]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
