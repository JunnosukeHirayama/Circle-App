import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function ensureUser(opts: {
  email: string;
  password: string;
  name: string;
  role?: "APPLICANT" | "ORGANIZER";
  bio?: string;
  affiliation?: string;
  location?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        email: opts.email,
        password: opts.password,
        name: opts.name,
        role: opts.role ?? "APPLICANT",
      },
    });
  }
  return prisma.user.update({
    where: { email: opts.email },
    data: {
      name: opts.name,
      role: opts.role ?? "APPLICANT",
      bio: opts.bio ?? null,
      affiliation: opts.affiliation ?? null,
      location: opts.location ?? null,
      emailVerified: true,
    },
  });
}

// 1募集者アカウント = 1サークル。各サークルに専用の運営アカウントを用意する。
const CIRCLES = [
  {
    email: "organizer@example.com", // ← デモ用ログイン（募集側）
    name: "週末フットサルクラブ",
    description:
      "毎週土曜の午前に、初心者中心でゆるくフットサルをしています。運動不足を解消したい方、新しい友達がほしい方、大歓迎です！終わったあとはみんなでランチに行くこともあります⚽️",
    rules: "・遅刻するときは連絡を\n・ケガに気をつけて楽しく\n・経験者は初心者に優しく",
    category: "スポーツ",
    audience: "WORKING" as const,
    frequency: "毎週土曜の午前",
    area: "東京都",
    location: "渋谷区",
    capacity: 24,
    coverColor: "rose",
    tags: ["初心者歓迎", "社会人", "週末"],
    feeText: "活動の都度 500円（コート代）",
  },
  {
    email: "yomikai@example.com",
    name: "まったり読書会",
    description:
      "月に1回、カフェに集まって最近読んだ本を紹介し合う読書会です。ジャンルは自由。読書好きが集まって、ゆるくおしゃべりしています📚",
    rules: "・本の感想は尊重し合う\n・ネタバレ前は一声かけて",
    category: "勉強・学習",
    audience: "BOTH" as const,
    frequency: "月1回（第3日曜）",
    area: "オンライン",
    location: "東京でも不定期開催",
    capacity: 12,
    coverColor: "sky",
    tags: ["読書", "カフェ", "ゆるい"],
    feeText: null,
  },
  {
    email: "yakei@example.com",
    name: "夜景写真サークル",
    description:
      "カメラ片手に夜の街を歩きながら写真を撮るサークルです。機材は問いません。スマホでもOK！撮った写真はグループで共有して、みんなで上達していきましょう📷",
    rules: null,
    category: "アート・創作",
    audience: "WORKING" as const,
    frequency: "隔週の金曜夜",
    area: "東京都",
    location: "都内各所",
    capacity: null,
    coverColor: "violet",
    tags: ["カメラ", "夜景", "初心者OK"],
    feeText: null,
  },
  {
    email: "asarun@example.com",
    name: "朝活ランニング部",
    description:
      "週2回、出勤前の朝に皇居周辺を走っています。ペースはゆっくりめ。1人だと続かないランニングも、仲間がいれば楽しく続けられます🏃",
    rules: null,
    category: "スポーツ",
    audience: "BOTH" as const,
    frequency: "週2回（火・木の朝）",
    area: "東京都",
    location: "皇居周辺",
    capacity: 30,
    coverColor: "emerald",
    tags: ["朝活", "ランニング", "健康"],
    feeText: null,
  },
  {
    email: "bodoge@example.com",
    name: "ボードゲーム交流会",
    description:
      "毎月第2土曜にボードゲームを持ち寄って遊ぶ交流会です。定番からマイナーゲームまで色々。初対面でもすぐ仲良くなれる雰囲気です🎲",
    rules: null,
    category: "ゲーム",
    audience: "BOTH" as const,
    frequency: "毎月第2土曜",
    area: "東京都",
    location: "新宿区",
    capacity: 16,
    coverColor: "orange",
    tags: ["ボドゲ", "交流", "初心者歓迎"],
    feeText: "月額 500円",
  },
  {
    email: "eikaiwa@example.com",
    name: "英語おしゃべりカフェ",
    description:
      "レベル問わず、英語でゆるく雑談する会です。間違えてもOK！とにかく話すことを大切にしています。海外旅行が好きな人も多いです🌍",
    rules: null,
    category: "勉強・学習",
    audience: "STUDENT" as const,
    frequency: "毎週水曜の夜",
    area: "オンライン",
    location: null,
    capacity: null,
    coverColor: "amber",
    tags: ["英会話", "オンライン", "初心者歓迎"],
    feeText: "年額 3,000円",
  },
];

async function main() {
  console.log("🌱 Seeding demo data...");

  const applicant = await ensureUser({
    email: "taro@example.com",
    password: "password123",
    name: "たろう",
    role: "APPLICANT",
    affiliation: "〇〇大学 3年",
    location: "東京・神奈川",
    bio: "運動不足解消したい大学生です。フットサル経験少しあり。",
  });

  // クリーンな 1:1 状態を作るため、既存のブロック・サークルをリセット
  await prisma.block.deleteMany({});
  await prisma.circle.deleteMany({});

  const created: { id: string; name: string }[] = [];
  for (const c of CIRCLES) {
    const org = await ensureUser({
      email: c.email,
      password: "password123",
      name: c.name,
      role: "ORGANIZER",
      affiliation: "サークル運営",
    });
    const circle = await prisma.circle.create({
      data: {
        name: c.name,
        description: c.description,
        rules: c.rules,
        category: c.category,
        audience: c.audience,
        frequency: c.frequency,
        area: c.area,
        location: c.location,
        capacity: c.capacity,
        coverColor: c.coverColor,
        tags: c.tags,
        hasFee: c.feeText != null,
        feeText: c.feeText,
        memberCount: Math.floor(Math.random() * 8) + 3,
        ownerId: org.id,
      },
    });
    created.push({ id: circle.id, name: circle.name });
  }

  // サンプル応募（たろう → まったり読書会）。チャットも作成。
  const target = created.find((c) => c.name === "まったり読書会");
  if (target) {
    const app = await prisma.application.create({
      data: {
        circleId: target.id,
        applicantId: applicant.id,
        message: "はじめまして！読書が好きで応募しました。ぜひ参加させてください📚",
      },
    });
    const room = await prisma.chatRoom.create({
      data: { circleId: target.id, applicationId: app.id },
    });
    await prisma.message.create({
      data: { roomId: room.id, senderId: applicant.id, content: app.message },
    });
  }

  console.log("✅ Seed complete!");
  console.log("   organizer@example.com / password123  (募集側 = 週末フットサルクラブ)");
  console.log("   taro@example.com / password123        (応募側)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
