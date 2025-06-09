import type { chatStep } from "@core/db/models/chatStep.models";

export interface ContextWithStep {
  step: {
    context: () => (typeof chatStep.$inferSelect)["context"] | null;
    saveStep: (
      ...args: [boolean, Partial<(typeof chatStep.$inferSelect)["context"]>]
    ) => Promise<void>;
    findStep: () => Promise<(typeof chatStep.$inferSelect)["context"] | null>;
    deleteStep: () => Promise<void>;
    isActive: () => Promise<boolean>;
    toggleStep: (enable: boolean) => Promise<void>;
  };
}
