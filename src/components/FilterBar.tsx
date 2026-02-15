"use client";

import { X } from "lucide-react";
import type { CrewFilters, CrewRole, VisualStyle, Equipment } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterBarProps {
  filters: CrewFilters;
  onChange: (filters: CrewFilters) => void;
}

const roles: CrewRole[] = ["摄影", "灯光", "美术", "录音"];
const styles: VisualStyle[] = ["日系", "赛博", "胶片", "纪实", "复古"];
const equipments: Equipment[] = [
  "Sony FX3",
  "Sony A7S3",
  "Blackmagic",
  "有车",
  "无人机",
  "稳定器",
];

const roleTranslationKeys: Record<CrewRole, string> = {
  "摄影": "photography",
  "灯光": "lighting",
  "美术": "art",
  "录音": "sound",
};

const styleTranslationKeys: Record<VisualStyle, string> = {
  "日系": "japanese",
  "赛博": "cyber",
  "胶片": "film",
  "纪实": "documentary",
  "复古": "retro",
};

const equipmentTranslationKeys: Record<string, string> = {
  "有车": "hasCar",
  "无人机": "drone",
  "稳定器": "stabilizer",
};

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
        active
          ? "border-[#5CC8D6]/50 bg-[#5CC8D6]/20 text-[#5CC8D6]"
          : "border-white/15 bg-white/5 text-neutral-400 hover:border-white/25 hover:text-neutral-300"
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const { t } = useLanguage();
  const hasFilters = filters.role || filters.style || filters.equipment;

  const toggleRole = (role: CrewRole) => {
    onChange({ ...filters, role: filters.role === role ? null : role });
  };
  const toggleStyle = (style: VisualStyle) => {
    onChange({ ...filters, style: filters.style === style ? null : style });
  };
  const toggleEquipment = (eq: Equipment) => {
    onChange({ ...filters, equipment: filters.equipment === eq ? null : eq });
  };
  const clearAll = () => {
    onChange({ role: null, style: null, equipment: null });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex flex-col gap-4">
        {/* 职业 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-medium text-neutral-500 w-12">
            {t("filter", "profession")}
          </span>
          {roles.map((r) => (
            <FilterPill
              key={r}
              label={t("filter", roleTranslationKeys[r])}
              active={filters.role === r}
              onClick={() => toggleRole(r)}
            />
          ))}
        </div>

        {/* 风格 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-medium text-neutral-500 w-12">
            {t("filter", "style")}
          </span>
          {styles.map((s) => (
            <FilterPill
              key={s}
              label={t("filter", styleTranslationKeys[s])}
              active={filters.style === s}
              onClick={() => toggleStyle(s)}
            />
          ))}
        </div>

        {/* 设备 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-medium text-neutral-500 w-12">
            {t("filter", "equipment")}
          </span>
          {equipments.map((e) => (
            <FilterPill
              key={e}
              label={equipmentTranslationKeys[e] ? t("filter", equipmentTranslationKeys[e]) : e}
              active={filters.equipment === e}
              onClick={() => toggleEquipment(e)}
            />
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="mt-4 flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-3 w-3" />
          {t("filter", "clearFilter")}
        </button>
      )}
    </div>
  );
}
