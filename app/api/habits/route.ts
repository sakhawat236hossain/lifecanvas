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

    const collection = await dbConnect(collections.habits);
    const habits = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(habits, { status: 200 });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "অভ্যাসসমূহ আনতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const collection = await dbConnect(collections.habits);

    if (!body.title) {
      return NextResponse.json(
        { error: "অভ্যাসের নাম আবশ্যক" },
        { status: 400 }
      );
    }

    const newHabit = {
      userId,
      title: body.title,
      color: body.color || "from-emerald-400 to-teal-600",
      history: [], // Stores dates in YYYY-MM-DD format e.g., ["2026-05-18"]
      streak: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newHabit);

    return NextResponse.json(
      { message: "অভ্যাস সফলভাবে তৈরি হয়েছে", id: result.insertedId, ...newHabit },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "অভ্যাস তৈরি করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
