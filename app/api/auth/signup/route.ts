import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, image } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "সবগুলো ফিল্ড পূরণ করা আবশ্যক" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "একটি সঠিক ইমেইল ঠিকানা প্রদান করুন" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    const usersCol = await dbConnect(collections.users);

    // Check if email already exists
    const existingUser = await usersCol.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      image: image || null,
      provider: "credentials",
      createdAt: new Date(),
    };

    await usersCol.insertOne(newUser);

    return NextResponse.json(
      { message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন" },
      { status: 500 }
    );
  }
}
