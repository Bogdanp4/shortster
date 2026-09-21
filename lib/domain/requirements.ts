import type { CampaignRequirements } from "@/lib/types"
import { formatNumber } from "@/lib/format"

export interface RequirementChecklistItem {
  key: string
  label: string
}

type Translate = (key: string, params?: Record<string, string | number>) => string

/**
 * Single source of truth for the human-readable requirements checklist shown
 * to creators, advertisers, and moderators. Always derived from the
 * structured CampaignRequirements object instead of being maintained as a
 * separate parallel string list, so the three views can never drift apart.
 */
export function buildRequirementsChecklist(req: CampaignRequirements, t: Translate): RequirementChecklistItem[] {
  const items: RequirementChecklistItem[] = []

  const hasMin = req.minVideoDurationSeconds > 0
  const hasMax = req.maxVideoDurationSeconds > 0
  if (hasMin && hasMax) {
    items.push({
      key: "duration",
      label: t("requirements.durationRange", { min: req.minVideoDurationSeconds, max: req.maxVideoDurationSeconds }),
    })
  } else if (hasMin) {
    items.push({ key: "duration", label: t("requirements.durationMin", { min: req.minVideoDurationSeconds }) })
  } else if (hasMax) {
    items.push({ key: "duration", label: t("requirements.durationMax", { max: req.maxVideoDurationSeconds }) })
  }

  if (req.minViews > 0) {
    items.push({ key: "minViews", label: t("requirements.minViews", { count: formatNumber(req.minViews) }) })
  }

  if (req.minFollowers > 0) {
    items.push({
      key: "minFollowers",
      label: t("requirements.minFollowers", { count: formatNumber(req.minFollowers) }),
    })
  }

  items.push({ key: "language", label: t(`requirements.language.${req.videoLanguage}`) })

  if (req.specificAudience) {
    items.push({
      key: "audience",
      label: req.audienceDescription
        ? t("requirements.audienceWithDescription", { description: req.audienceDescription })
        : t("requirements.audienceGeneric"),
    })
  }

  if (req.requiredHashtag) {
    items.push({ key: "hashtag", label: t("requirements.hashtag", { tag: req.requiredHashtag }) })
  }

  return items
}
