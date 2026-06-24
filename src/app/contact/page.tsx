import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { LegalLayout, Section } from "@/components/LegalLayout";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "お問い合わせ" };

// リリース時に実際の連絡先へ差し替えてください
const CONTACT_EMAIL = "support@example.com";

export default function ContactPage() {
  return (
    <LegalLayout title="お問い合わせ">
      <p className="text-sm leading-relaxed">
        サークルリンクに関するご質問・ご要望・不具合のご報告は、以下のメールアドレスまでご連絡ください。
        通報・規約違反のご報告も受け付けています。
      </p>

      <Section heading="メールでのお問い合わせ">
        <p>
          下記アドレス宛に、お名前・ご登録のメールアドレス・お問い合わせ内容を記載のうえお送りください。
          内容を確認のうえ、順次ご返信いたします。
        </p>
        <div className="pt-2">
          <ButtonLink href={`mailto:${CONTACT_EMAIL}`}>
            <Mail className="h-4 w-4" />
            {CONTACT_EMAIL} にメールする
          </ButtonLink>
        </div>
      </Section>

      <Section heading="運営者情報">
        <ul className="list-disc space-y-1 pl-5">
          <li>サービス名：サークルリンク</li>
          <li>運営者：（事業者名・代表者名を記載してください）</li>
          <li>所在地：（必要に応じて記載してください）</li>
          <li>連絡先：{CONTACT_EMAIL}</li>
        </ul>
      </Section>
    </LegalLayout>
  );
}
