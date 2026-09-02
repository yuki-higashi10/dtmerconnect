import type { Metadata } from "next";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "プライバシーポリシー | DTMer Connect",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="プライバシーポリシー" enactedDate="2026年9月3日">
      <LegalSection heading="1. はじめに">
        <p>
          DTMer Connect運営事務局(以下「当運営」といいます)は、当運営が提供するコミュニティサービス「DTMer
          Connect」(以下「本サービス」といいます)における利用者の情報の取り扱いについて、本プライバシーポリシー(以下「本ポリシー」といいます)を定めます。
        </p>
      </LegalSection>

      <LegalSection heading="2. 収集する情報">
        <p>本サービスは、利用登録・ご利用にあたり、以下の情報を取得します。</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>メールアドレス(本登録時)</li>
          <li>ユーザー名、プロフィール画像、自己紹介文、利用DAW、活動エリア、SNS/配信リンクなど、プロフィールに登録いただいた情報</li>
          <li>投稿内容(スレッド、コメント、楽曲、MIDI/パッチファイル、サムネイル画像等)</li>
          <li>いいね、フォロー、ダウンロード、視聴回数などの利用状況</li>
          <li>通報機能をご利用いただいた場合の通報内容</li>
          <li>IPアドレス、Cookie、アクセス日時などのアクセスログ</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. 利用目的">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>本サービスの提供、維持、保護および改善のため</li>
          <li>本人確認、認証、不正利用の防止のため</li>
          <li>利用規約に違反する投稿等への対応、モデレーションのため</li>
          <li>利用者からのお問い合わせへの対応のため</li>
          <li>本サービスに関する重要なお知らせなど、必要に応じたご連絡のため</li>
          <li>利用状況の分析による本サービスの改善・新機能検討のため</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. 第三者提供">
        <p>
          当運営は、以下の場合を除き、あらかじめ利用者の同意を得ることなく、第三者に個人情報を提供することはありません。
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>法令に基づく場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
          <li>国の機関等が法令の定める事務を遂行することに対して協力する必要がある場合</li>
        </ul>
        <p>
          なお、本サービスは以下の外部サービスを利用しており、これらの委託先に対して必要な範囲で情報を取り扱わせる場合があります。
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Supabase(データベース・認証基盤・ファイルストレージの提供)</li>
          <li>Vercel(本サービスのホスティング)</li>
          <li>Resend(お問い合わせフォームからのメール送信)</li>
          <li>Google Analytics(利用状況の分析)</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. 外部サービスの利用と国外へのデータ移転">
        <p>
          本サービスが利用する外部サービス(Supabase、Vercel、Resend、Google
          Analytics等)は、日本国外にサーバーを設置している場合があります。これに伴い、取得した情報の一部が国外で保存・処理されることがあります。
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookie等の利用">
        <p>
          本サービスは、ログイン状態の維持等を目的として、Cookieおよびこれに類する技術を利用する場合があります。利用者はブラウザの設定によりCookieを無効化できますが、その場合、本サービスの一部機能が利用できなくなることがあります。
        </p>
      </LegalSection>

      <LegalSection heading="7. 安全管理措置">
        <p>
          当運営は、取得した情報の漏えい、滅失またはき損の防止その他の安全管理のために、必要かつ適切な措置を講じます。
        </p>
      </LegalSection>

      <LegalSection heading="8. 情報の開示・訂正・削除">
        <p>
          利用者は、当運営の定める手続きにより、当運営に対し自己の登録情報の開示、訂正、削除等を請求することができます。ご希望の場合は、下記のお問い合わせ窓口までご連絡ください。
        </p>
        <p>
          なお、利用者が本サービスを退会した場合、当該利用者が投稿したコンテンツ(スレッド、コメント、楽曲、MIDI/パッチ等)は、本サービス上のすべての公開画面において表示されなくなります。
        </p>
      </LegalSection>

      <LegalSection heading="9. お問い合わせ窓口">
        <p>本ポリシーに関するお問い合わせは、運営者情報ページに記載の連絡先までお願いいたします。</p>
      </LegalSection>

      <LegalSection heading="10. プライバシーポリシーの変更">
        <p>
          当運営は、必要と判断した場合には、利用者に通知することなくいつでも本ポリシーを変更することができるものとします。変更後の本ポリシーは、本サービス上に表示した時点から効力を生じるものとします。
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
