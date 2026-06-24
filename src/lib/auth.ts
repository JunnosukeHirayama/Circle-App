import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // パスワード再設定メール
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "【サークルリンク】パスワード再設定のご案内",
        text: `以下のリンクからパスワードを再設定してください（1時間有効）。\n\n${url}\n\n心当たりがない場合はこのメールを破棄してください。\n\n— サークルリンク`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "【サークルリンク】メールアドレスの確認",
        text: `ご登録ありがとうございます。以下のリンクをクリックしてメールアドレスを確認してください。\n\n${url}\n\n— サークルリンク`,
      });
    },
  },
  // In development, accept requests from whichever localhost port `next dev`
  // picks. In production, lock this down to your real domain via BETTER_AUTH_URL.
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"]
      : Array.from({ length: 11 }, (_, i) => `http://localhost:${3000 + i}`),
  user: {
    additionalFields: {
      // "APPLICANT" | "ORGANIZER"
      role: { type: "string", required: false, defaultValue: "APPLICANT", input: true },
      emailNotifications: { type: "boolean", required: false, defaultValue: true },
      bio: { type: "string", required: false },
      affiliation: { type: "string", required: false },
      location: { type: "string", required: false },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  // nextCookies() must be the last plugin so Set-Cookie headers propagate
  // correctly from server actions / route handlers.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
