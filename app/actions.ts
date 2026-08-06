"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";

export type StoredAnswer = {
  activity: string;
  date: string;
  time: string;
  location: string;
  note: string;
  answeredAt: string;
};

type AnswerInput = {
  activity: string;
  date: string;
  time: string;
  location: string;
  note: string;
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "answers.json");
const MAX_FIELD_LENGTH = 200;
const MAX_NOTE_LENGTH = 800;

function clamp(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function readAnswers(): Promise<StoredAnswer[]> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Reads every answer she has ever saved, oldest first. */
export async function getAnswers(): Promise<StoredAnswer[]> {
  return readAnswers();
}

/** Saves her latest answer to disk, then sends her to the keepsake page. */
export async function saveAnswer(input: AnswerInput) {
  const record: StoredAnswer = {
    activity: clamp(input.activity, MAX_FIELD_LENGTH),
    date: clamp(input.date, MAX_FIELD_LENGTH),
    time: clamp(input.time, MAX_FIELD_LENGTH),
    location: clamp(input.location, MAX_FIELD_LENGTH),
    note: clamp(input.note, MAX_NOTE_LENGTH),
    answeredAt: new Date().toISOString()
  };

  const answers = await readAnswers();
  answers.push(record);

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(answers, null, 2), "utf8");

  redirect("/her-answer");
}
