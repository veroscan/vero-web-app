# Connecting SharePoint or OneDrive to Vero

You can bring files into your document vault straight from SharePoint or OneDrive, instead of downloading and uploading them. This page says exactly what we read, what we keep, and how to stop.

## How it works

1. An owner or admin of your Vero organisation chooses **Connect SharePoint**.
2. Microsoft opens its own sign-in page. You sign in with your work or school account and allow Vero. We never see your Microsoft password.
3. In Vero, you open Microsoft's own file picker and choose the files you want, and the company they belong to. Up to 10 at a time.
4. Only those files are brought in.

**Your IT admin may need to approve Vero first.** Many organisations only let an admin allow new apps. If Microsoft says you need an admin's approval, ask your IT admin to approve Vero for your organisation, then connect again.

## What we read

**Only the files you pick.** Microsoft's permission for this (`Files.Read`, "read your files") is broader than that: Microsoft doesn't offer one that is limited to the files you pick. So the limit is ours: Vero only ever asks Microsoft for the files you picked, by their id, and never lists, searches or opens anything else. Picking a folder brings in nothing.

Vero uses the permission only to read. It never changes, moves, shares or deletes anything.

For each file you pick we read its name, type, size, the date it was last changed, and the file itself.

## What we take

PDF, PNG, JPEG and plain text files, up to the same size as an upload. Word files and other types aren't taken from here yet: upload them from your computer instead. You can bring in up to 50 files a day.

## What we keep

- The files you picked, in your vault, marked as coming from SharePoint or OneDrive (which file, when it was last changed there, your organisation's Microsoft tenant id, and when we fetched it).
- The access Microsoft gives us, locked with encryption, so you can pick more files later.

We never keep your email address, your name or your password, and nothing from files you didn't pick.

## What it means, and what it doesn't

Each file waits for you to confirm it, exactly like a file you upload. Bringing a file in from SharePoint or OneDrive is **not** a check that it is genuine, signed or legally sufficient, and it never earns a verified badge. A lawyer's review is still the way to know that.

## If the connection stops working

If you remove Vero, your password changes, your organisation asks you to sign in again, or Microsoft ends the access, Vero shows **"SharePoint access ended, connect again."** Connect again and carry on; nothing already in your vault is lost.

## How to disconnect

- **In Vero:** an owner or admin chooses **Disconnect SharePoint**. We delete the access Microsoft gave us.
- **On Microsoft's side:** Microsoft doesn't let us withdraw that access from our end. To remove Vero from your account too, open **My Apps** (myapps.microsoft.com) and remove Vero there. Your IT admin can also remove Vero for everyone in your organisation.

Documents already in your vault stay there until you delete them. Nothing more is read.
