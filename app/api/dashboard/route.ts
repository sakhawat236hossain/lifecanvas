import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const memoriesCol = await dbConnect(collections.memories);
    const goalsCol = await dbConnect(collections.goals);
    const habitsCol = await dbConnect(collections.habits);
    const achievementsCol = await dbConnect(collections.achievements);
    const journalsCol = await dbConnect(collections.journals);

    // 1. Memories stats
    const totalMemories = await memoriesCol.countDocuments({ userId });
    const recentMemories = await memoriesCol
      .find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    // 2. Goals stats
    const totalGoals = await goalsCol.countDocuments({ userId });
    const completedGoals = await goalsCol.countDocuments({
      userId,
      $expr: { $gte: ["$current", "$target"] }
    });

    // 3. Habits stats
    const totalHabits = await habitsCol.countDocuments({ userId });
    const habitsList = await habitsCol.find({ userId }).toArray();
    const maxStreak = habitsList.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    // 4. Achievements / XP stats & Levels
    const totalAchievements = await achievementsCol.countDocuments({ userId });
    const achievementsList = await achievementsCol.find({ userId }).toArray();
    const totalXP = achievementsList.reduce((sum, a) => sum + (a.points || 0), 0);

    // Leveling Logic: 500 XP per level
    const level = Math.floor(totalXP / 500) + 1;
    const levelXP = totalXP % 500;
    const levelProgress = Math.round((levelXP / 500) * 100);

    let levelTitle = "অভিযাত্রী";
    if (level === 2) levelTitle = "অনুসন্ধিৎসু";
    else if (level === 3) levelTitle = "সৃষ্টিকর্তা";
    else if (level === 4) levelTitle = "অধ্যবসায়ী";
    else if (level >= 5) levelTitle = "ক্যানভাস মাস্টার";

    const levelStats = {
      level,
      levelXP,
      levelProgress,
      levelTitle,
      nextLevelThreshold: 500
    };

    // 5. Recent Journals
    const recentJournals = await journalsCol
      .find({ userId })
      .sort({ date: -1 })
      .limit(3)
      .toArray();

    // 6. Year in Pixels Data (Past 1 Year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const journalsForGrid = await journalsCol
      .find({
        userId,
        date: { $gte: oneYearAgo }
      })
      .project({ date: 1, mood: 1, title: 1 })
      .toArray();

    const pixelsData = journalsForGrid.map(j => {
      let dateStr = null;
      try {
        dateStr = j.date ? new Date(j.date).toISOString().split("T")[0] : null;
      } catch (e) {
        console.error("Error formatting date for Year in Pixels:", e);
      }
      return {
        date: dateStr,
        mood: j.mood || "শান্তপূর্ণ",
        title: j.title
      };
    }).filter(p => p.date !== null);

    // 7. Comprehensive Mood Analytics (Merging Memories & Journals)
    const memoriesMoods = await memoriesCol.aggregate([
      { $match: { userId } },
      { $group: { _id: "$mood", count: { $sum: 1 } } }
    ]).toArray();

    const journalsMoods = await journalsCol.aggregate([
      { $match: { userId } },
      { $group: { _id: "$mood", count: { $sum: 1 } } }
    ]).toArray();

    const moodCounts: { [key: string]: number } = {};
    const mergeMoodStats = (stats: any[]) => {
      stats.forEach(s => {
        if (s._id) {
          moodCounts[s._id] = (moodCounts[s._id] || 0) + s.count;
        }
      });
    };

    mergeMoodStats(memoriesMoods);
    mergeMoodStats(journalsMoods);

    const totalMoodLogs = Object.values(moodCounts).reduce((sum, val) => sum + val, 0);
    const moodStats = Object.keys(moodCounts).map(name => ({
      name,
      value: moodCounts[name],
      percentage: totalMoodLogs > 0 ? Math.round((moodCounts[name] / totalMoodLogs) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    // 8. Cinematic Memory Rewind ("ঠিক ১ বছর আগে আজকের দিনে")
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    let rewindItem = null;

    const allMemories = await memoriesCol.find({ userId }).toArray();
    const sameDayMemory = allMemories.find(m => {
      const mDate = new Date(m.date);
      return mDate.getMonth() === todayMonth && 
             mDate.getDate() === todayDay && 
             mDate.getFullYear() < today.getFullYear();
    });

    if (sameDayMemory) {
      rewindItem = {
        _id: sameDayMemory._id,
        title: sameDayMemory.title,
        description: sameDayMemory.description || "",
        image: sameDayMemory.image || null,
        date: sameDayMemory.date,
        type: "memory",
        badge: "স্মৃতি রিওয়াইন্ড"
      };
    } else {
      const allJournals = await journalsCol.find({ userId }).toArray();
      const sameDayJournal = allJournals.find(j => {
        const jDate = new Date(j.date);
        return jDate.getMonth() === todayMonth && 
               jDate.getDate() === todayDay && 
               jDate.getFullYear() < today.getFullYear();
      });

      if (sameDayJournal) {
        rewindItem = {
          _id: sameDayJournal._id,
          title: sameDayJournal.title,
          description: sameDayJournal.content || "",
          image: null,
          date: sameDayJournal.date,
          type: "journal",
          badge: "দিনলিপি রিওয়াইন্ড"
        };
      } else if (allMemories.length > 0) {
        // Fallback to random memory for Nostalgia
        const randomMem = allMemories[Math.floor(Math.random() * allMemories.length)];
        rewindItem = {
          _id: randomMem._id,
          title: randomMem.title,
          description: randomMem.description || "",
          image: randomMem.image || null,
          date: randomMem.date,
          type: "memory",
          badge: "নস্টালজিয়া রিকল"
        };
      }
    }

    // 9. Local AI Tag-Mood Insights
    const tagMoodCounts: { [tag: string]: { [mood: string]: number } } = {};
    const tagTotalCounts: { [tag: string]: number } = {};

    allMemories.forEach(m => {
      let tags: string[] = [];
      if (Array.isArray(m.tags)) {
        tags = m.tags;
      } else if (typeof m.tags === "string" && m.tags.trim() !== "") {
        tags = m.tags.split(",").map((t: string) => t.trim());
      }

      const mood = m.mood;
      if (mood && tags.length > 0) {
        tags.forEach((tag: string) => {
          if (!tag) return;
          const cleanTag = tag.startsWith("#") ? tag : `#${tag}`;
          if (!tagMoodCounts[cleanTag]) {
            tagMoodCounts[cleanTag] = {};
            tagTotalCounts[cleanTag] = 0;
          }
          tagMoodCounts[cleanTag][mood] = (tagMoodCounts[cleanTag][mood] || 0) + 1;
          tagTotalCounts[cleanTag]++;
        });
      }
    });

    const insights: string[] = [];
    const sortedTags = Object.keys(tagTotalCounts).sort((a, b) => tagTotalCounts[b] - tagTotalCounts[a]);

    sortedTags.slice(0, 2).forEach(tag => {
      const moods = tagMoodCounts[tag];
      const bestMood = Object.keys(moods).sort((a, b) => moods[b] - moods[a])[0];
      const bestMoodCount = moods[bestMood];
      const percentage = Math.round((bestMoodCount / tagTotalCounts[tag]) * 100);
      
      let moodVerb = "শান্ত ও প্রফুল্ল";
      if (bestMood.includes("😊")) moodVerb = "উচ্ছ্বসিত ও আনন্দদায়ক 😊";
      else if (bestMood.includes("🧘")) moodVerb = "শান্তপূর্ণ ও স্থির 🧘";
      else if (bestMood.includes("🤩")) moodVerb = "অত্যಂತ রোমাঞ্চিত ও উত্তেজিত 🤩";
      else if (bestMood.includes("🥹")) moodVerb = "স্মৃতিকাতর ও আবেগপ্রবণ 🥹";
      else if (bestMood.includes("💖")) moodVerb = "কৃতজ্ঞ ও ভালোবাসায় পূর্ণ 💖";
      else if (bestMood.includes("😔")) moodVerb = "কিছুটা বিষণ্ণ ও চিন্তিত 😔";

      insights.push(
        `আপনি যখনই '${tag}' ট্যাগটি ব্যবহার করেছেন, আপনার মেজাজ ${percentage}% সময় '${moodVerb}' ছিল!`
      );
    });

    if (insights.length === 0) {
      insights.push("আপনার স্মৃতিতে আরও হ্যাশট্যাগ যোগ করলে এখানে চমৎকার এআই আত্ম-বিশ্লেষণ ফুটে উঠবে!");
    }

    return NextResponse.json({
      totalMemories,
      recentMemories,
      totalGoals,
      completedGoals,
      totalHabits,
      maxStreak,
      totalAchievements,
      totalXP,
      levelStats,
      recentJournals,
      pixelsData,
      moodStats,
      rewindItem,
      insights
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "ড্যাশবোর্ডের পরিসংখ্যান আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
