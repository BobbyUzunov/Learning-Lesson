import { PageLoader } from "@/components/page-loader";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export default async function AdminLoading() {
  const language = await getLanguage();
  const copy = t(language);

  return <PageLoader label={copy.common.loading} />;
}
