import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function ensureUser(opts: {
  email: string;
  password: string;
  name: string;
  bio?: string;
  affiliation?: string;
  location?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (!existing) {
    await auth.api.signUpEmail({
      body: { email: opts.email, password: opts.password, name: opts.name },
    });
  }
  const user = await prisma.user.update({
    where: { email: opts.email },
    data: {
      name: opts.name,
      bio: opts.bio ?? null,
      affiliation: opts.affiliation ?? null,
      location: opts.location ?? null,
      emailVerified: true,
    },
  });
  return user;
}

async function main() {
  console.log("🌱 Seeding demo data...");

  const organizer = await ensureUser({
    email: "organizer@example.com",
    password: "password123",
    name: "さくら",
    affiliation: "イベント運営チーム",
    location: "東京",
    bio: "いろんなサークルを運営しています！お気軽にどうぞ。",
  });

  await ensureUser({
    email: "taro@example.com",
    password: "password123",
    name: "たろう",
    affiliation: "〇〇大学 3年",
    location: "東京・神奈川",
    bio: "運動不足解消したい大学生です。フットサル経験少しあり。",
  });

  const circles = [
    {
      name: "週末フットサルクラブ",
      description:
        "毎週土曜の午前に、初心者中心でゆるくフットサルをしています。運動不足を解消したい方、新しい友達がほしい方、大歓迎です！終わったあとはみんなでランチに行くこともあります⚽️",
      rules: "・遅刻するときは連絡を\n・ケガに気をつけて楽しく\n・経験者は初心者に優しく",
      category: "スポーツ",
      audience: "WORKING" as const,
      location: "東京・渋谷",
      capacity: 24,
      coverColor: "rose",
      tags: ["初心者歓迎", "社会人", "週末"],
    },
    {
      name: "まったり読書会",
      description:
        "月に1回、カフェに集まって最近読んだ本を紹介し合う読書会です。ジャンルは自由。読書好きが集まって、ゆるくおしゃべりしています📚",
      rules: "・本の感想は尊重し合う\n・ネタバレ前は一声かけて",
      category: "勉強・学習",
      audience: "BOTH" as const,
      location: "オンライン+東京",
      capacity: 12,
      coverColor: "sky",
      tags: ["読書", "カフェ", "ゆるい"],
    },
    {
      name: "夜景写真サークル",
      description:
        "カメラ片手に夜の街を歩きながら写真を撮るサークルです。機材は問いません。スマホでもOK！撮った写真はグループで共有して、みんなで上達していきましょう📷",
      category: "アート・創作",
      audience: "WORKING" as const,
      location: "東京近郊",
      coverColor: "violet",
      tags: ["カメラ", "夜景", "初心者OK"],
    },
    {
      name: "朝活ランニング部",
      description:
        "週2回、出勤前の朝に皇居周辺を走っています。ペースはゆっくりめ。1人だと続かないランニングも、仲間がいれば楽しく続けられます🏃",
      category: "スポーツ",
      audience: "BOTH" as const,
      location: "東京・皇居",
      capacity: 30,
      coverColor: "emerald",
      tags: ["朝活", "ランニング", "健康"],
    },
    {
      name: "ボードゲーム交流会",
      description:
        "毎月第2土曜にボードゲームを持ち寄って遊ぶ交流会です。定番からマイナーゲームまで色々。初対面でもすぐ仲良くなれる雰囲気です🎲",
      category: "ゲーム",
      audience: "BOTH" as const,
      location: "東京・新宿",
      capacity: 16,
      coverColor: "orange",
      tags: ["ボドゲ", "交流", "初心者歓迎"],
    },
    {
      name: "英語おしゃべりカフェ",
      description:
        "レベル問わず、英語でゆるく雑談する会です。間違えてもOK！とにかく話すことを大切にしています。海外旅行が好きな人も多いです🌍",
      category: "勉強・学習",
      audience: "STUDENT" as const,
      location: "オンライン",
      coverColor: "amber",
      tags: ["英会話", "オンライン", "初心者歓迎"],
    },
  ];

  for (const c of circles) {
    const exists = await prisma.circle.findFirst({ where: { name: c.name } });
    if (exists) {
      // keep demo data fresh (e.g. newly added audience field)
      await prisma.circle.update({ where: { id: exists.id }, data: { audience: c.audience } });
      continue;
    }
    await prisma.circle.create({
      data: { ...c, memberCount: Math.floor(Math.random() * 8) + 3, ownerId: organizer.id },
    });
  }

  console.log("✅ Seed complete!");
  console.log("   organizer@example.com / password123  (募集側)");
  console.log("   taro@example.com / password123        (応募側)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
