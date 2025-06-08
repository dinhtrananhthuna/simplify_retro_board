BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[BoardPresence] (
    [id] NVARCHAR(1000) NOT NULL,
    [boardId] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [lastSeen] DATETIME2 NOT NULL CONSTRAINT [BoardPresence_lastSeen_df] DEFAULT CURRENT_TIMESTAMP,
    [online] BIT NOT NULL CONSTRAINT [BoardPresence_online_df] DEFAULT 1,
    CONSTRAINT [BoardPresence_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [BoardPresence_boardId_email_key] UNIQUE NONCLUSTERED ([boardId],[email])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
