import { Redirect } from "expo-router";

/** Unknown links open Today (or the welcome, before onboarding). */
export default function NotFound() {
  return <Redirect href="/" />;
}
