import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";

export async function GET() {
  try {
    const memoriesCol = await dbConnect(collections.memories);
    const goalsCol = await dbConnect(collections.goals);
    const habitsCol = await dbConnect(collections.habits);
    const achievementsCol = await dbConnect(collections.achievements);
    const journalsCol = await dbConnect(collections.journals);

    // 1. Memories stats
    const totalMemories = await memoriesCol.countDocuments();
    const recentMemories = await memoriesCol
      .find({})
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    // 2. Goals stats
    const totalGoals = await goalsCol.countDocuments();
    const completedGoals = await goalsCol.countDocuments({
      $expr: { $gte: ["$current", "$target"] }
    });

    // 3. Habits stats
    const totalHabits = await habitsCol.countDocuments();
    const habitsList = await habitsCol.find({}).toArray();
    const maxStreak = habitsList.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    // 4. Achievements / XP stats & Levels
    const totalAchievements = await achievementsCol.countDocuments();
    const achievementsList = await achievementsCol.find({}).toArray();
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
      .find({})
      .sort({ date: -1 })
      .limit(3)
      .toArray();

    // 6. Year in Pixels Data (Past 1 Year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const journalsForGrid = await journalsCol
      .find({
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
      { $group: { _id: "$mood", count: { $sum: 1 } } }
    ]).toArray();

    const journalsMoods = await journalsCol.aggregate([
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

    const allMemories = await memoriesCol.find({}).toArray();
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
      const allJournals = await journalsCol.find({}).toArray();
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
      rewindItem
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "ড্যাশবোর্ডের পরিসংখ্যান আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
