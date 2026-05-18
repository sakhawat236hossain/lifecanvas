import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";

export async function GET() {
  try {
    const collection = await dbConnect(collections.achievements);
    const achievements = await collection.find({}).sort({ date: -1 }).toArray();
    return NextResponse.json(achievements, { status: 200 });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "অর্জনসমূহ সংগ্রহ করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const collection = await dbConnect(collections.achievements);

    if (!body.title) {
      return NextResponse.json(
        { error: "অর্জনের শিরোনাম আবশ্যক" },
        { status: 400 }
      );
    }

    const newAchievement = {
      title: body.title,
      description: body.description || "",
      icon: body.icon || "Trophy",
      points: Number(body.points) || 100, // XP Points
      date: body.date ? new Date(body.date) : new Date(),
      color: body.color || "from-amber-400 to-orange-600",
      image: body.image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newAchievement);

    return NextResponse.json(
      { message: "অর্জন সফলভাবে সংরক্ষিত হয়েছে", id: result.insertedId, ...newAchievement },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating achievement:", error);
    return NextResponse.json(
      { error: "অর্জন সংরক্ষণ করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
