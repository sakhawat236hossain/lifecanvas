import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

// Robust helper to calculate the consecutive streak in days
function calculateStreak(historyDates: string[]): number {
  if (historyDates.length === 0) return 0;

  // Format YYYY-MM-DD, clean up any duplicates and sort descending (newest first)
  const uniqueDates = Array.from(new Set(historyDates))
    .map(d => {
      const parts = d.split("-");
      // Create local date object
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    })
    .sort((a, b) => b.getTime() - a.getTime());

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const mostRecent = new Date(uniqueDates[0]);
  mostRecent.setHours(0, 0, 0, 0);

  // If most recent is neither today nor yesterday, streak is broken (0)
  if (mostRecent.getTime() !== today.getTime() && mostRecent.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(mostRecent);

  for (const date of uniqueDates) {
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const body = await request.json();
    const collection = await dbConnect(collections.habits);

    const habit = await collection.findOne({ _id: new ObjectId(id), userId });
    if (!habit) {
      return NextResponse.json({ error: "অভ্যাসটি পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    // Toggle completion for the provided date (default to local today date YYYY-MM-DD)
    const localToday = new Date();
    const offset = localToday.getTimezoneOffset();
    const localAdjusted = new Date(localToday.getTime() - offset * 60 * 1000);
    const defaultDate = localAdjusted.toISOString().split("T")[0];

    const targetDate = body.date || defaultDate;
    let newHistory = habit.history || [];

    if (newHistory.includes(targetDate)) {
      // Uncheck / Remove from history
      newHistory = newHistory.filter((d: string) => d !== targetDate);
    } else {
      // Check / Add to history
      newHistory.push(targetDate);
    }

    const newStreak = calculateStreak(newHistory);

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          history: newHistory,
          streak: newStreak,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "অভ্যাস সফলভাবে আপডেট হয়েছে",
      history: newHistory,
      streak: newStreak,
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json({ error: "অভ্যাস আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const collection = await dbConnect(collections.habits);
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "অভ্যাস পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "অভ্যাস সফলভাবে মুছে ফেলা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json({ error: "অভ্যাস মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
