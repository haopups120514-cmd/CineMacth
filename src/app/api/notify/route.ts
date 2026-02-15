import { NextRequest, NextResponse } from "next/server";

// 发件人地址 — 配置自定义域名后替换
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "CineMatch <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cinematch-koko.vercel.app";

function getResendClient() {
  const { Resend } = require("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

// 邮件文案多语言
type EmailLocale = "zh" | "en" | "ja";

const emailTexts: Record<EmailLocale, {
  subject: (title: string) => string;
  tagline: string;
  heading: string;
  greeting: (name: string) => string;
  body: (applicant: string) => string;
  messageLabel: string;
  cta: string;
  footer: string;
}> = {
  zh: {
    subject: (title) => `🎬 你的招募「${title}」收到了新申请 — CineMatch`,
    tagline: "连接学生电影创作者",
    heading: "收到新的申请！🎉",
    greeting: (name) => `${name}，你好！`,
    body: (applicant) => `<strong style="color: #fff;">${applicant}</strong> 申请了你发布的招募：`,
    messageLabel: "申请留言",
    cta: "查看申请 →",
    footer: "你收到这封邮件是因为有人申请了你在 CineMatch 上发布的招募。",
  },
  en: {
    subject: (title) => `🎬 New application for "${title}" — CineMatch`,
    tagline: "Connecting student filmmakers",
    heading: "New Application Received! 🎉",
    greeting: (name) => `Hi ${name},`,
    body: (applicant) => `<strong style="color: #fff;">${applicant}</strong> has applied to your recruitment post:`,
    messageLabel: "Application Message",
    cta: "View Applications →",
    footer: "You're receiving this because someone applied to your post on CineMatch.",
  },
  ja: {
    subject: (title) => `🎬 「${title}」に新しい応募がありました — CineMatch`,
    tagline: "学生映画クリエイターをつなぐ",
    heading: "新しい応募が届きました！🎉",
    greeting: (name) => `${name} さん、こんにちは！`,
    body: (applicant) => `<strong style="color: #fff;">${applicant}</strong> さんがあなたの募集に応募しました：`,
    messageLabel: "応募メッセージ",
    cta: "応募を確認 →",
    footer: "CineMatch であなたの募集に応募があったため、このメールが送信されました。",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;
    console.log("[notify] 收到通知请求:", type, "to:", data?.posterEmail);

    if (!process.env.RESEND_API_KEY) {
      console.error("[notify] RESEND_API_KEY 未配置");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      );
    }

    switch (type) {
      case "recruitment_application": {
        const {
          posterEmail,
          posterName,
          applicantName,
          recruitmentTitle,
          applicationMessage,
          locale: rawLocale,
        } = data;

        if (!posterEmail || !recruitmentTitle) {
          return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
          );
        }

        // 确定邮件语言（根据发布者偏好）
        const locale: EmailLocale = (rawLocale === "en" || rawLocale === "ja") ? rawLocale : "zh";
        const txt = emailTexts[locale];

        const resend = getResendClient();
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: posterEmail,
          subject: txt.subject(recruitmentTitle),
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e5e5e5; border-radius: 16px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; color: #5CC8D6;">CineMatch</h1>
                <p style="margin: 8px 0 0; font-size: 14px; color: #999;">${txt.tagline}</p>
              </div>
              
              <div style="padding: 32px 24px;">
                <h2 style="margin: 0 0 16px; font-size: 18px; color: #fff;">
                  ${txt.heading}
                </h2>
                
                <p style="margin: 0 0 8px; color: #ccc; font-size: 14px;">
                  ${txt.greeting(`<strong style="color: #5CC8D6;">${posterName || "Creator"}</strong>`)}
                </p>
                
                <p style="margin: 0 0 24px; color: #ccc; font-size: 14px; line-height: 1.6;">
                  ${txt.body(applicantName || "Someone")}
                </p>
                
                <div style="background: rgba(92,200,214,0.1); border: 1px solid rgba(92,200,214,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #5CC8D6;">
                    📋 ${recruitmentTitle}
                  </p>
                </div>
                
                ${applicationMessage ? `
                <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">${txt.messageLabel}</p>
                  <p style="margin: 0; font-size: 14px; color: #ddd; line-height: 1.6;">${applicationMessage}</p>
                </div>
                ` : ""}
                
                <a href="${SITE_URL}/plans" 
                   style="display: inline-block; background: #5CC8D6; color: #050505; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
                  ${txt.cta}
                </a>
              </div>
              
              <div style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                  ${txt.footer}
                </p>
              </div>
            </div>
          `,
        });

        if (error) {
          console.error("[notify] Resend API 错误:", JSON.stringify(error));
          return NextResponse.json(
            { error: "Failed to send email", detail: error },
            { status: 500 }
          );
        }

        console.log("[notify] 邮件发送成功 → ", posterEmail);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: "Unknown notification type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[notify] 未捕获异常:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}
