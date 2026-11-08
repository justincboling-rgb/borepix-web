"use client";

import { useId, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { dateInputClasses, TextField } from "@/components/auth/field";
import { TrackOptions } from "@/components/auth/track-options";
import { focusFirstInvalid, NAME_MAX, validateEmail, validateExamDate, validateName } from "@/components/auth/validation";
import { Button } from "@/components/ui/button";
import type { ExamTrack } from "@/lib/content/types";
import { setProfile, updateProfile, type Profile } from "@/lib/store/progress";

type FieldName = "name" | "email" | "examDate";
type Errors = Partial<Record<FieldName, string>>;
const FIELD_ORDER: readonly FieldName[] = ["name", "email", "examDate"];

type Props = {
  /** Current profile, or null for a guest (saving creates one). Remount with a new key when it changes. */
  profile: Profile | null;
  /** Reports a success message; the parent owns the live region so it survives the remount after creation. */
  onSaved: (message: string) => void;
  /** Any edit clears the previous success message. */
  onEdit: () => void;
};

export function ProfileForm({ profile, onSaved, onEdit }: Props) {
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [track, setTrack] = useState<ExamTrack>(profile?.track ?? "radiography");
  const [examDate, setExamDate] = useState(profile?.examDate ?? "");
  const [errors, setErrors] = useState<Errors>({});

  function edit<T>(setter: (v: T) => void, field?: FieldName) {
    return (value: T) => {
      setter(value);
      onEdit();
      if (field && errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const now = Date.now();
    const checks: Errors = {
      name: validateName(name),
      email: validateEmail(email),
      examDate: validateExamDate(examDate, now),
    };
    const next: Errors = {};
    for (const field of FIELD_ORDER) {
      if (checks[field]) next[field] = checks[field];
    }
    if (Object.keys(next).length > 0) {
      flushSync(() => setErrors(next));
      focusFirstInvalid(form, FIELD_ORDER, next);
      return;
    }

    setErrors({});
    const fields = { name: name.trim(), email: email.trim(), track, examDate: examDate || undefined };
    if (profile) {
      updateProfile(fields);
      onSaved("Changes saved.");
    } else {
      setProfile({ ...fields, plan: "trial", createdAt: now });
      onSaved("Profile created in this browser.");
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="mt-6 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={id("name")}
          name="name"
          label="Name"
          autoComplete="name"
          maxLength={NAME_MAX}
          required
          value={name}
          onChange={(e) => edit(setName, "name")(e.target.value)}
          error={errors.name}
        />
        <TextField
          id={id("email")}
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => edit(setEmail, "email")(e.target.value)}
          error={errors.email}
        />
      </div>

      <TrackOptions
        name={id("track")}
        legend="ARRT® registry exam"
        value={track}
        onChange={(t) => edit(setTrack)(t)}
      />

      <TextField
        id={id("examDate")}
        name="examDate"
        type="date"
        label="Exam date"
        optional
        hint="Drives the countdown on your dashboard. Clear it if you have not scheduled yet."
        value={examDate}
        onChange={(e) => edit(setExamDate, "examDate")(e.target.value)}
        error={errors.examDate}
        className="sm:max-w-xs"
        inputClassName={dateInputClasses}
      />

      <div className="pt-1">
        <Button type="submit">{profile ? "Save changes" : "Create profile"}</Button>
      </div>
    </form>
  );
}
