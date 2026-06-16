"use client";

import * as Popover from "@radix-ui/react-popover";
import { ExternalLink } from "lucide-react";
import { GLOSSARY } from "@/data/glossary";

interface TermPopoverProps {
  termKey: string;
  label: string;
}

export function TermPopover({ termKey, label }: TermPopoverProps) {
  const entry = GLOSSARY[termKey];

  if (!entry) {
    return <span className="term-trigger term-trigger-missing">{label}</span>;
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="term-trigger" aria-label={`${label} 용어 설명 열기`}>
          {label}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="term-popover" sideOffset={6} collisionPadding={12}>
          <Popover.Arrow className="term-popover-arrow" />
          <h3 className="term-popover-title">{entry.term}</h3>
          <p className="term-popover-summary">{entry.summary}</p>
          {entry.references && entry.references.length > 0 ? (
            <ul className="term-popover-refs">
              {entry.references.map((ref) => (
                <li key={ref.href}>
                  <a href={ref.href} target="_blank" rel="noreferrer">
                    <ExternalLink size={12} aria-hidden="true" />
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
