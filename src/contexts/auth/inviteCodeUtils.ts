
// Valid invitation codes (in a real app, these would be stored in a database)
export const VALID_INVITE_CODES = ["SSC2024", "AGENT007", "WELCOME1"];

// Function to validate invite codes
export const validateInviteCode = async (code: string): Promise<boolean> => {
  // In a real app, this would verify against a database
  return VALID_INVITE_CODES.includes(code);
};
