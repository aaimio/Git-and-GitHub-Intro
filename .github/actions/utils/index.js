// If anyone decides that github-actions[bot] isn't worthy of commenting
// and wants to update it to another user (e.g. DerivFE), please update it here.
export const GITHUB_ACTIONS_BOT_NAME = "github-actions[bot]";

export const review_events = Object.freeze({
  APPROVE: "APPROVE",
  COMMENT: "COMMENT",
  REQUEST_CHANGES: "REQUEST_CHANGES",
});

export const review_states = Object.freeze({
  APPROVED: "APPROVED",
  COMMENTED: "COMMENTED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
});
