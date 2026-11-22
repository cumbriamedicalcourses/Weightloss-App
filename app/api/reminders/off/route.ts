import { admin, sameSecret, unsubscribeToken } from "@/lib/admin";

export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#e8f3fb;color:#1f2a37;margin:0;padding:48px 20px">
<div style="max-width:440px;margin:0 auto;background:#fff;border-radius:16px;padding:28px">
<h1 style="font-size:22px;margin:0 0 10px">${title}</h1><p style="line-height:1.5;margin:0 0 18px">${body}</p>
<a href="/journal" style="color:#1d4f91;font-weight:bold">Open your journal</a></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

/**
 * The "stop these emails" link in every reminder email lands here. Opening
 * the link only asks for confirmation, because some mail services open every
 * link in a message to check it. Pressing the button, or a mail app's own
 * unsubscribe button, sends the POST that switches the emails off.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("u") ?? "";
  const expected = uid ? unsubscribeToken(uid) : null;
  if (!expected || !sameSecret(url.searchParams.get("t") ?? "", expected)) {
    return page("That link did not work", "You can switch reminder emails off on the Profile page of your journal.", 400);
  }
  return page(
    "Stop reminder emails?",
    `<form method="post" style="margin:0"><button type="submit" style="background:#1d4f91;color:#fff;border:0;border-radius:10px;padding:12px 22px;font-size:16px;font-weight:bold;cursor:pointer">Yes, stop the emails</button></form>`,
  );
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("u") ?? "";
  const token = url.searchParams.get("t") ?? "";
  const expected = uid ? unsubscribeToken(uid) : null;
  const fb = admin();
  if (!fb || !expected || !sameSecret(token, expected)) {
    return page("That link did not work", "You can switch reminder emails off on the Profile page of your journal.", 400);
  }
  await fb.db.collection("users").doc(uid).set({ reminders: { email: false } }, { merge: true });
  return page("Reminder emails are off", "You will not get any more reminder emails. You can turn them back on at any time on the Profile page.");
}

