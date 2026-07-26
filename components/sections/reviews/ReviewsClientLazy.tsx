"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type ReviewsClientType from "./ReviewsClient";

/**
 * ReviewsClientLazy — wrapper client mínimo só para carregar o ReviewsClient sob demanda.
 *
 * Existe porque `ssr: false` não é permitido em `next/dynamic` dentro de um
 * Server Component, e Reviews é Server Component. Sem o wrapper, o chunk do
 * Swiper (~40 KB gz, caro de inicializar) entra no payload inicial.
 *
 * O motivo de existir a divisão: o Lighthouse mobile mediu **1.505 ms de Script
 * Evaluation** e um LCP com **84 % de render delay** — a main thread estava
 * ocupada antes de conseguir pintar o poster do hero. Esta seção fica muitas
 * dobras abaixo, então nada dela precisa disputar esse caminho.
 *
 * `ssr: false` é seguro aqui porque o slider não é CONTEÚDO: os títulos, as
 * tags e as métricas já vêm no HTML pelo Server Component pai. O cliente só
 * adiciona o comportamento de carrossel.
 */
const ReviewsClient = dynamic(() => import("./ReviewsClient"), { ssr: false });

export default function ReviewsClientLazy(props: ComponentProps<typeof ReviewsClientType>) {
  return <ReviewsClient {...props} />;
}
