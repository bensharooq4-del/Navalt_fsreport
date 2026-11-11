/**
 * App-wide constants. Change the company address in .env (EXPO_PUBLIC_COMPANY_EMAIL)
 * or edit the fallback below. This address ALWAYS receives a copy of every report.
 */
export const config = {
  companyName: "Navalt Solar & Electric Boats Pvt Ltd",
  companyEmail:
    process.env.EXPO_PUBLIC_COMPANY_EMAIL ?? "service@yourcompany.com",
} as const;
