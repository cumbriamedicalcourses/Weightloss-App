"use client";

import { useState } from "react";
import { fromDisplayWeight, fromStones, toDisplayWeight, toStones } from "@/lib/calc";
import type { WeightUnit } from "@/lib/types";

/**
 * A weight field in the person's unit: one box for kg or lb, two for stones
 * and pounds. Reports the weight in kg, or null while it is empty or invalid.
 * Give it a new `key` to reset it, for example when the unit changes.
 */
export function WeightInput({
  id,
  label,
  unit,
  kg,
  onChange,
}: {
  id: string;
  label: string;
  unit: WeightUnit;
  kg: number | null;
  onChange: (kg: number | null) => void;
}) {
  const start = kg && unit === "st" ? toStones(kg) : null;
  const [one, setOne] = useState(kg && unit !== "st" ? String(toDisplayWeight(kg, unit)) : "");
  const [st, setSt] = useState(start ? String(start.st) : "");
  const [lb, setLb] = useState(start ? String(start.lb) : "");

  if (unit !== "st") {
    return (
      <div>
        <label className="label" htmlFor={id}>{label} ({unit})</label>
        <input
          id={id}
          className="field"
          inputMode="decimal"
          value={one}
          onChange={(e) => {
            setOne(e.target.value);
            const v = Number(e.target.value);
            onChange(v > 0 ? fromDisplayWeight(v, unit) : null);
          }}
        />
      </div>
    );
  }

  function report(nextSt: string, nextLb: string) {
    const s = Number(nextSt);
    const l = Number(nextLb || 0);
    onChange(nextSt.trim() && s >= 0 && l >= 0 && l < 14 && s * 14 + l > 0 ? fromStones(s, l) : null);
  }

  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            id={id}
            aria-label={`${label}, stones`}
            className="field pr-9"
            inputMode="numeric"
            value={st}
            onChange={(e) => {
              setSt(e.target.value);
              report(e.target.value, lb);
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">st</span>
        </div>
        <div className="relative">
          <input
            id={`${id}-lb`}
            aria-label={`${label}, pounds`}
            className="field pr-9"
            inputMode="decimal"
            value={lb}
            onChange={(e) => {
              setLb(e.target.value);
              report(st, e.target.value);
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">lb</span>
        </div>
      </div>
    </fieldset>
  );
}
