import { NextRequest, NextResponse } from "next/server";

// 发件人地址 — 配置自定义域名后替换
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "CineMatch <onboarding@resend.dev>";

function getResendClient() {
  const { Resend } = require("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!process.env.RESEND_API_KEY) {
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
        } = data;

        if (!posterEmail || !recruitmentTitle) {
          return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
          );
        }

        const resend = getResendClient();
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: posterEmail,
          subject: `🎬 New application for "${recruitmentTitle}" — CineMatch`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e5e5e5; border-radius: 16px; overflow: hidden;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; color: #5CC8D6;">CineMatch</h1>
                <p style="margin: 8px 0 0; font-size: 14px; color: #999;">Your creative partner platform</p>
              </div>
              
              <!-- Body -->
              <div style="padding: 32px 24px;">
                <h2 style="margin: 0 0 16px; font-size: 18px; color: #fff;">
                  New Application Received! 🎉
                </h2>
                
                <p style="margin: 0 0 8px; color: #ccc; font-size: 14px;">
                  Hi <strong style="color: #5CC8D6;">${posterName || "Creator"}</strong>,
                </p>
                
                <p style="margin: 0 0 24px; color: #ccc; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #fff;">${applicantName || "Someone"}</strong> has applied to your recruitment post:
                </p>
                
                <div style="background: rgba(92,200,214,0.1); border: 1px solid rgba(92,200,214,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #5CC8D6;">
                    📋 ${recruitmentTitle}
                  </p>
                </div>
                
                ${applicationMessage ? `
                <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Application Message</p>
                  <p style="margin: 0; font-size: 14px; color: #ddd; line-height: 1.6;">${applicationMessage}</p>
                </div>
                ` : ""}
                
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://cinematch-koko.vercel.app"}/plans" 
                   style="display: inline-block; background: #5CC8D6; color: #050505; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
                  View Applications →
                </a>
              </div>
              
              <!-- Footer -->
              <div style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                  You're receiving this because someone applied to your post on CineMatch.
                </p>
              </div>
            </div>
          `,
        });

        if (error) {
          console.error("Failed to send email:", error);
          return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: "Unknown notification type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Notification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
