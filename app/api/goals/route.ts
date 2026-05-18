import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";

export async function GET() {
  try {
    const collection = await dbConnect(collections.goals);
    const goals = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "লক্ষ্যসমূহ আনতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const collection = await dbConnect(collections.goals);

    if (!body.title || body.target === undefined || !body.deadline) {
      return NextResponse.json(
        { error: "আবশ্যকীয় ফিল্ডসমূহ পূরণ করুন" },
        { status: 400 }
      );
    }

    const newGoal = {
      title: body.title,
      target: Number(body.target),
      current: Number(body.current || 0),
      unit: body.unit || "%",
      deadline: new Date(body.deadline),
      color: body.color || "from-primary to-primary/60",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newGoal);

    return NextResponse.json(
      { message: "লক্ষ্য সফলভাবে তৈরি হয়েছে", id: result.insertedId, ...newGoal },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "লক্ষ্য তৈরি করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
