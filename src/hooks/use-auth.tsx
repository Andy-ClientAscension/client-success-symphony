
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

// Re-export the hook from use-auth.ts
export { useAuth as useDirectAuth } from "./use-auth";

export function useAuth() {
  console.log("useAuth wrapper hook called");
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error("useAuth must be used within an AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  console.log("useAuth hook returning context:", {
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    userExists: !!context.user
  });
  
  return context;
}
