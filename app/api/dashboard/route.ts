import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";

export async function GET() {
  try {
    const collection = await dbConnect(collections.memories);

    // Aggregate totals and stats
    const totalMemories = await collection.countDocuments();
    
    const recentMemories = await collection
      .find({})
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    // Group by mood
    const moodStatsResult = await collection.aggregate([
      { $group: { _id: "$mood", count: { $sum: 1 } } }
    ]).toArray();

    const moodStats = moodStatsResult.map(stat => ({
      name: stat._id || "Unknown",
      value: stat.count
    }));

    return NextResponse.json({
      totalMemories,
      recentMemories,
      moodStats
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "ড্যাশবোর্ডের পরিসংখ্যান আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
