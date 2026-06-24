import type { Metadata } from "next";
import { LegalLayout, Section } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="プライバシーポリシー" updated="2026年6月13日">
      <p className="text-sm leading-relaxed">
        サークルリンク（以下「本サービス」）の運営者（以下「運営者」）は、利用者の個人情報を
        重要なものと認識し、個人情報の保護に関する法律および関連法令を遵守するとともに、
        以下のとおりプライバシーポリシーを定めます。
      </p>

      <Section heading="1. 取得する情報">
        <ul className="list-disc space-y-1 pl-5">
          <li>アカウント情報：メールアドレス、パスワード（暗号化して保存）、表示名、アカウント種別</li>
          <li>プロフィール情報：自己紹介、所属、活動希望エリア、プロフィール画像</li>
          <li>サークル情報：募集者が登録するサークルの内容・画像</li>
          <li>応募・チャット情報：応募メッセージ、チャットの送受信内容</li>
          <li>利用状況：アクセスログ、IPアドレス、ブラウザ情報、Cookie等</li>
        </ul>
      </Section>

      <Section heading="2. 利用目的">
        <ul className="list-disc space-y-1 pl-5">
          <li>本サービスの提供・本人確認・ログイン状態の維持のため</li>
          <li>応募者と募集者のマッチングおよびチャット機能の提供のため</li>
          <li>新着メッセージ等の通知メールの送信のため（設定でオフにできます）</li>
          <li>お問い合わせ対応、不正利用の防止、サービスの改善のため</li>
        </ul>
      </Section>

      <Section heading="3. 第三者提供">
        <p>
          運営者は、法令に基づく場合を除き、利用者の同意なく個人情報を第三者に提供しません。
        </p>
      </Section>

      <Section heading="4. 外部サービスの利用">
        <p>
          本サービスは、機能提供のため以下のような外部サービスを利用することがあります。これらの
          サービスにおける情報の取扱いは、各サービスの定めに従います。
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>メール配信サービス（新着メッセージ等の通知メールの送信）</li>
          <li>ホスティング・データベース等のインフラサービス</li>
        </ul>
      </Section>

      <Section heading="5. Cookie等の利用">
        <p>
          本サービスは、ログイン状態の維持等のためにCookieおよび類似技術を利用します。
          ブラウザの設定によりCookieを無効にできますが、その場合本サービスの一部機能が
          利用できなくなることがあります。
        </p>
      </Section>

      <Section heading="6. 安全管理">
        <p>
          運営者は、個人情報の漏えい・滅失・毀損の防止その他の安全管理のために必要かつ適切な
          措置を講じます。パスワードは暗号化して保存します。
        </p>
      </Section>

      <Section heading="7. 開示・訂正・削除">
        <p>
          利用者は、自己の個人情報について、開示・訂正・利用停止・削除を求めることができます。
          ご希望の場合は、お問い合わせ窓口までご連絡ください。なお、アカウント情報の多くは
          マイページから確認・変更できます。
        </p>
      </Section>

      <Section heading="8. 未成年者の利用">
        <p>
          未成年者が本サービスを利用する場合は、保護者の同意を得たうえでご利用ください。
        </p>
      </Section>

      <Section heading="9. ポリシーの変更">
        <p>
          本ポリシーの内容は、法令の変更等に応じて変更されることがあります。変更後の内容は、
          本サービス上に掲示した時点から効力を生じます。
        </p>
      </Section>

      <Section heading="10. お問い合わせ窓口">
        <p>
          個人情報の取扱いに関するお問い合わせは、
          <a href="/contact" className="font-semibold text-amber-600 hover:underline">
            お問い合わせ
          </a>
          ページよりご連絡ください。
        </p>
      </Section>
    </LegalLayout>
  );
}
