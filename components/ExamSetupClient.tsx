"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, SlidersHorizontal } from "lucide-react";
import type { ExamQuestion, ExamSettings, Level } from "@/lib/types";
import { EXAM_PARTS } from "@/lib/exam-parts";
import { filterPool } from "@/lib/exam-builder";

const SETTINGS_KEY = "ios-interview-exam-settings";

const DEFAULT_SETTINGS: ExamSettings = {
  level: "all",
  objectiveCount: 5,
  subjectiveCount: 5,
  partIds: [],
  durationMinutes: 30,
};

interface ExamSetupClientProps {
  questions: ExamQuestion[];
}

export function ExamSetupClient({ questions }: ExamSetupClientProps) {
  const [settings, setSettings] = useState<ExamSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<ExamSettings> & Record<string, unknown>;
        setSettings({
          level: (parsed.level as Level | "all") ?? DEFAULT_SETTINGS.level,
          objectiveCount:
            typeof parsed.objectiveCount === "number"
              ? parsed.objectiveCount
              : DEFAULT_SETTINGS.objectiveCount,
          subjectiveCount:
            typeof parsed.subjectiveCount === "number"
              ? parsed.subjectiveCount
              : DEFAULT_SETTINGS.subjectiveCount,
          partIds: Array.isArray(parsed.partIds) ? (parsed.partIds as string[]) : [],
          durationMinutes:
            typeof parsed.durationMinutes === "number"
              ? parsed.durationMinutes
              : DEFAULT_SETTINGS.durationMinutes,
        });
      } catch {
        /* keep defaults */
      }
    }
    setHydrated(true);
  }, []);

  const objectiveTotal = useMemo(
    () => questions.filter((q) => q.type === "objective").length,
    [questions]
  );
  const subjectiveTotal = useMemo(
    () => questions.filter((q) => q.type === "subjective").length,
    [questions]
  );

  const { objectivePool, subjectivePool } = useMemo(
    () => filterPool({ bank: questions, settings }),
    [questions, settings]
  );

  const partCounts = useMemo(() => {
    const map = new Map<string, { obj: number; subj: number }>();
    for (const part of EXAM_PARTS) map.set(part.id, { obj: 0, subj: 0 });
    const allowedLevel = (q: ExamQuestion) =>
      settings.level === "all" || q.level === settings.level;
    for (const q of questions) {
      if (!allowedLevel(q)) continue;
      const c = map.get(q.partId) ?? { obj: 0, subj: 0 };
      if (q.type === "objective") c.obj += 1;
      else c.subj += 1;
      map.set(q.partId, c);
    }
    return map;
  }, [questions, settings.level]);

  const usedObjective = Math.min(settings.objectiveCount, objectivePool.length);
  const usedSubjective = Math.min(settings.subjectiveCount, subjectivePool.length);
  const total = usedObjective + usedSubjective;

  function updateSetting<K extends keyof ExamSettings>(key: K, value: ExamSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function togglePart(id: string) {
    setSettings((current) => {
      const has = current.partIds.includes(id);
      const next = has ? current.partIds.filter((p) => p !== id) : [...current.partIds, id];
      return { ...current, partIds: next };
    });
  }

  function startExam() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.location.href = "/exam/session";
  }

  return (
    <section className="tool-surface" aria-labelledby="exam-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Mock Interview</p>
          <h1 id="exam-title">실전 모의고사</h1>
        </div>
        <span className="count-pill">{total}문항 출제 예정</span>
      </div>

      <div className="metric-row">
        <div className="metric">
          <strong>{questions.length}</strong>
          <span>전체 문제</span>
        </div>
        <div className="metric">
          <strong>{objectiveTotal}</strong>
          <span>객관식 (총)</span>
        </div>
        <div className="metric">
          <strong>{subjectiveTotal}</strong>
          <span>주관식 (총)</span>
        </div>
      </div>

      <div className="settings-grid">
        <fieldset className="setting-group">
          <legend>레벨</legend>
          <SegmentedControl
            value={settings.level}
            options={[
              ["all", "전체"],
              ["basic", "주니어"],
              ["intermediate", "미들"],
              ["advanced", "심화"],
            ]}
            onChange={(value) => updateSetting("level", value as Level | "all")}
          />
        </fieldset>

        <fieldset className="setting-group span-2">
          <legend>
            파트 선택 <span className="legend-hint">선택 안 하면 전체</span>
          </legend>
          <div className="part-chip-row">
            {EXAM_PARTS.map((part) => {
              const counts = partCounts.get(part.id);
              const sumPart = (counts?.obj ?? 0) + (counts?.subj ?? 0);
              if (sumPart === 0) return null;
              const active = settings.partIds.includes(part.id);
              return (
                <button
                  key={part.id}
                  type="button"
                  className={active ? "part-chip active" : "part-chip"}
                  onClick={() => togglePart(part.id)}
                  title={`객관식 ${counts?.obj ?? 0} · 주관식 ${counts?.subj ?? 0}`}
                >
                  {part.label}
                  <span className="chip-meta">{sumPart}</span>
                </button>
              );
            })}
          </div>
          {settings.partIds.length > 0 ? (
            <button
              type="button"
              className="link-danger"
              onClick={() => updateSetting("partIds", [])}
            >
              파트 선택 초기화
            </button>
          ) : null}
        </fieldset>

        <fieldset className="setting-group">
          <legend>
            객관식 수 <span className="legend-hint">최대 {objectivePool.length}</span>
          </legend>
          <NumberStepper
            value={settings.objectiveCount}
            min={0}
            max={objectivePool.length}
            step={1}
            onChange={(v) => updateSetting("objectiveCount", v)}
            presets={[0, 5, 10, 20, 30, 50]}
          />
        </fieldset>

        <fieldset className="setting-group">
          <legend>
            주관식 수 <span className="legend-hint">최대 {subjectivePool.length}</span>
          </legend>
          <NumberStepper
            value={settings.subjectiveCount}
            min={0}
            max={subjectivePool.length}
            step={1}
            onChange={(v) => updateSetting("subjectiveCount", v)}
            presets={[0, 3, 5, 10, 20, 30]}
          />
        </fieldset>

        <fieldset className="setting-group">
          <legend>제한 시간</legend>
          <SegmentedControl
            value={String(settings.durationMinutes)}
            options={[
              ["15", "15분"],
              ["30", "30분"],
              ["45", "45분"],
              ["60", "60분"],
              ["90", "90분"],
            ]}
            onChange={(value) => updateSetting("durationMinutes", Number(value))}
          />
        </fieldset>
      </div>

      <div className="exam-preview">
        <span>
          출제 예정: <strong>객관식 {usedObjective}</strong> + <strong>주관식 {usedSubjective}</strong> ={" "}
          <strong>{total}문항</strong> · 제한 {settings.durationMinutes}분
        </span>
        {settings.objectiveCount > objectivePool.length ||
        settings.subjectiveCount > subjectivePool.length ? (
          <span className="warn">요청량보다 풀이 부족해 가능한 만큼만 출제됩니다.</span>
        ) : null}
      </div>

      <div className="action-row">
        <p>객관식은 자동 채점, 주관식은 제출 후 DB에 저장되어 채점 페이지에서 수동 채점합니다.</p>
        <button
          className="primary-button"
          onClick={startExam}
          disabled={!hydrated || total === 0}
        >
          <Play size={18} aria-hidden="true" />
          시험 시작
        </button>
      </div>

      <div className="exam-note">
        <SlidersHorizontal size={18} aria-hidden="true" />
        <span>설정은 브라우저에 저장됩니다. 시험 결과는 SQLite DB에 누적됩니다.</span>
      </div>
    </section>
  );
}

interface SegmentedControlProps {
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}

function SegmentedControl({ value, options, onChange }: SegmentedControlProps) {
  return (
    <div className="segmented-control">
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          className={value === optionValue ? "active" : ""}
          onClick={() => onChange(optionValue)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  presets?: number[];
}

function NumberStepper({ value, min, max, step, onChange, presets }: NumberStepperProps) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="number-stepper">
      <div className="stepper-row">
        <button type="button" onClick={() => onChange(clamp(value - step))} disabled={value <= min}>
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        />
        <button type="button" onClick={() => onChange(clamp(value + step))} disabled={value >= max}>
          +
        </button>
      </div>
      {presets ? (
        <div className="stepper-presets">
          {presets
            .filter((p) => p <= max)
            .map((p) => (
              <button
                key={p}
                type="button"
                className={value === p ? "active" : ""}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
