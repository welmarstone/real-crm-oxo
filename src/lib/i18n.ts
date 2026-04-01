import { cookies } from "next/headers";
import ru from "@/locales/ru.json";

export function getTranslator() {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  
  const dict = locale === "ru" ? (ru as Record<string, string>) : {};
  
  return (key: string) => {
    return dict[key] || key;
  };
}
