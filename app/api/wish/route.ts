import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body?.message || "").trim();
    const name = String(body?.name || "Anonymous").trim();

    // Always succeed even if email is not configured
    if (!process.env.RESEND_API_KEY) {
      console.log("Wish received (no email configured):", { name, message });
      return NextResponse.json({ ok: true, emailed: false });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const EMAIL_TO = process.env.EMAIL_TO || "kamireddyrithvik@gmail.com";
    const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

    await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: `🎁 New Wish from ${name}`,
      text: `Name: ${name}\n\nWish:\n${message}\n\nTime: ${new Date().toLocaleString()}`,
    });

    return NextResponse.json({ ok: true, emailed: true });
  } catch (err) {
    console.error("Wish API error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
