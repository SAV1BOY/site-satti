import { getTranslations } from "next-intl/server";
import Client from "./ReviewsClient";
import s from "./Reviews.module.css";
type C = { value: string };
export default async function Reviews() {
  const t = await getTranslations();
  return (
    <section id="depoimentos" className={s.root}>
      <p>{t("reviews.sectionLabel")}</p>
      <h2>{t("reviews.title")}</h2>
      <Client
        quote={(t.raw("reviews.quote") as C).value}
        name={(t.raw("reviews.name") as C).value}
        role={(t.raw("reviews.role") as C).value}
        prev={t("cases.previousAriaLabel")}
        next={t("cases.nextAriaLabel")}
      />
    </section>
  );
}
