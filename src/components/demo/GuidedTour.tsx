"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  route?: string; // Navigate to this route before showing the step
}

// =============================================================================
// Tour Steps
// =============================================================================

const TOUR_STEPS: TourStep[] = [
  {
    target: "project-grid",
    title: "Projectoverzicht",
    description:
      "Hier ziet u al uw lopende, geplande en afgeronde projecten in een overzichtelijk dashboard.",
    route: "/demo/portal",
  },
  {
    target: "search-filter",
    title: "Zoeken & Filteren",
    description:
      "Zoek snel een project op naam of filter op status. Handig als u meerdere projecten heeft.",
    route: "/demo/portal",
  },
  {
    target: "project-card-first",
    title: "Project Openen",
    description:
      "Klik op een projectkaart om de details te bekijken: taken, planning, en meer.",
    route: "/demo/portal",
  },
  {
    target: "project-stats",
    title: "Project Statistieken",
    description:
      "Bekijk in een oogopslag de voortgang, het aantal taken, en de start- en einddatum.",
    route: "/demo/portal/projects/demo-project-001",
  },
  {
    target: "tasks",
    title: "Taken Overzicht",
    description:
      "Alle taken van het project met hun status, voortgang en planning. U ziet precies wat er gedaan is en wat er nog moet gebeuren.",
    route: "/demo/portal/projects/demo-project-001",
  },
  {
    target: "gantt",
    title: "Gantt Planning",
    description:
      "De visuele planning laat zien hoe taken zich verhouden in de tijd. De rode lijn toont de huidige datum.",
    route: "/demo/portal/projects/demo-project-001",
  },
  {
    target: "notes",
    title: "Notities",
    description:
      "Communiceer direct met uw projectleider via notities. Stel vragen of geef feedback.",
    route: "/demo/portal/projects/demo-project-001",
  },
];

// =============================================================================
// GuidedTour Component
// =============================================================================

interface GuidedTourProps {
  onClose: () => void;
}

export function GuidedTour({ onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [tooltipStyle, setTooltipStyle] = React.useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = React.useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Navigate to the correct route if needed
  React.useEffect(() => {
    if (step.route && pathname !== step.route) {
      router.push(step.route);
    }
  }, [currentStep, step.route, pathname, router]);

  // Position the tooltip relative to the target element
  React.useEffect(() => {
    function positionTooltip() {
      const targetEl = document.querySelector(`[data-tour="${step.target}"]`);

      if (!targetEl) {
        // If target not found (e.g., page still loading), retry
        const timer = setTimeout(positionTooltip, 300);
        return () => clearTimeout(timer);
      }

      const rect = targetEl.getBoundingClientRect();
      const padding = 8;

      // Highlight position
      setHighlightStyle({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Tooltip position - always left or right of the target
      const tooltipWidth = 320;
      const tooltipGap = 20;
      const style: React.CSSProperties = { width: tooltipWidth };

      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      // Vertical: center tooltip on the target, clamped to viewport
      const targetCenterY = rect.top + rect.height / 2 + window.scrollY;
      const tooltipHeight = 200; // approximate
      style.top = Math.max(
        window.scrollY + 16,
        Math.min(targetCenterY - tooltipHeight / 2, window.scrollY + window.innerHeight - tooltipHeight - 16)
      );

      // Horizontal: pick the side with more space
      if (spaceRight >= tooltipWidth + tooltipGap || spaceRight >= spaceLeft) {
        style.left = rect.right + tooltipGap;
      } else {
        style.left = rect.left - tooltipGap - tooltipWidth;
      }

      // Clamp horizontal to viewport
      style.left = Math.max(16, Math.min(style.left as number, window.innerWidth - tooltipWidth - 16));

      setTooltipStyle(style);
      setIsVisible(true);

      // Scroll target into view
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setIsVisible(false);
    const timer = setTimeout(positionTooltip, 100);
    return () => clearTimeout(timer);
  }, [currentStep, step, pathname]);

  function handleNext() {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/40" onClick={onClose} />

      {/* Highlight ring */}
      <div
        className={cn(
          "fixed z-[9999] rounded-lg ring-4 ring-zinc-900 ring-offset-2 dark:ring-zinc-100 pointer-events-none transition-all duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{
          ...highlightStyle,
          position: "absolute",
        }}
      />

      {/* Tooltip */}
      <div
        className={cn(
          "absolute z-[10000] rounded-xl glass-strong p-5 glow-strong transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={tooltipStyle}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          aria-label="Tour sluiten"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step counter */}
        <div className="mb-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          Stap {currentStep + 1} van {TOUR_STEPS.length}
        </div>

        {/* Content */}
        <h3 className="mb-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {step.title}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {step.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Vorige
          </Button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === currentStep
                    ? "bg-zinc-900 dark:bg-zinc-100"
                    : "bg-zinc-300 dark:bg-zinc-600"
                )}
              />
            ))}
          </div>

          <Button size="sm" onClick={handleNext} className="gap-1">
            {isLastStep ? "Afsluiten" : "Volgende"}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}
