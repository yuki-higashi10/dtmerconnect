import type { Metadata } from "next";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "運営者情報 | DTMer Connect",
};

export default function AboutPage() {
  return (
    <LegalPageLayout title="運営者情報">
      <LegalSection heading="サービス名">
        <p>DTMer Connect</p>
      </LegalSection>

      <LegalSection heading="運営">
        <p>DTMer Connect運営事務局</p>
      </LegalSection>

      <LegalSection heading="お問い合わせ">
        <p>
          本サービスに関するお問い合わせ、著作権侵害やその他の問題のご報告は、下記の連絡先までお願いいたします。
        </p>
        <p>メールアドレス: contact@example.com(仮の連絡先です。正式な連絡先に差し替え予定です)</p>
      </LegalSection>

      <LegalSection heading="サービス内容">
        <p>
          DTMer Connectは、DTM(デスクトップミュージック)に取り組むクリエイター向けのコミュニティサービスです。DAW別の情報交換、楽曲投稿、MIDI/パッチ共有などの機能を提供しています。
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
