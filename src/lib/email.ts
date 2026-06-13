// Lightweight email sender.
//
// - If RESEND_API_KEY is set, sends via the Resend HTTP API (no extra deps).
// - Otherwise (local dev), logs the email to the console so the feature is
//   fully wired and demonstrable without SMTP credentials.

type SendArgs = {
  to: string;
  subject: string;
  text: string;
};

const FROM = process.env.EMAIL_FROM ?? "Circle <onboarding@resend.dev>";

export async function sendEmail({ to, subject, text }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `\n📧 [email:dev] To: ${to}\n   Subject: ${subject}\n   ${text}\n   (RESEND_API_KEY 未設定のため実送信はスキップ)`,
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, text }),
    });
    if (!res.ok) {
      console.error("[email] Resend failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] send error:", err);
  }
}

/** Notification copy for a new chat message, by recipient role. */
export function newMessageEmail(opts: {
  recipientRole: "APPLICANT" | "ORGANIZER";
  circleName: string;
  applicantName: string;
  roomUrl: string;
}) {
  const subject =
    opts.recipientRole === "APPLICANT"
      ? `「${opts.circleName}」から新規メッセージが届きました！`
      : `応募者「${opts.applicantName}」から新規メッセージが届きました！`;

  const body =
    opts.recipientRole === "APPLICANT"
      ? `「${opts.circleName}」から新しいメッセージが届きました。\nチャットを確認しましょう。`
      : `応募者「${opts.applicantName}」から新しいメッセージが届きました。\nチャットを確認しましょう。`;

  return {
    subject,
    text: `${body}\n\n${opts.roomUrl}\n\n— Circle`,
  };
}
