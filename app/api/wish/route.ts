import { NextResponse } from "next/server";

type Body = {
  wish?: string;
  from?: string;
  photoIndex?: number;
  userAgent?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const wish = (body.wish || "").trim();
    if (!wish || wish.length < 2) return NextResponse.json({ ok: false, error: "Empty wish" }, { status: 400 });
    if (wish.length > 2000) return NextResponse.json({ ok: false, error: "Too long" }, { status: 413 });

    const EMAIL_TO = process.env.EMAIL_TO || "kamireddyrithvik@gmail.com";
    const EMAIL_FROM = process.env.EMAIL_FROM || "Birthday Wish <onboarding@resend.dev>";
    const subject = `New secret wish${body.from ? ` from ${body.from}` : ""}`;

    const meta = [
      body.from ? `From: ${body.from}` : null,
      typeof body.photoIndex === "number" ? `Photo index: ${body.photoIndex}` : null,
      body.userAgent ? `User-Agent: ${body.userAgent}` : null,
      `Time: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const text = `${wish}\n\n---\n${meta}`;

    // Resend (recommended)
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({ from: EMAIL_FROM, to: EMAIL_TO, subject, text });
      return NextResponse.json({ ok: true });
    }

    // SMTP fallback
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({ from: EMAIL_FROM, to: EMAIL_TO, subject, text });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Email not configured. Set RESEND_API_KEY or SMTP variables." },
      { status: 500 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
