import { RING_NODE_COUNTS } from "@/components/ui/PulseCircle";

/**
 * Fatia os 10 passos oficiais de `about.methodNodes` nos grupos que o grafo
 * desenha (4 / 3 / 3 — um por anel ROTULADO; o anel de 100 % é `disabled` na
 * spec e não carrega palavra nenhuma).
 *
 * Vive num módulo próprio porque os dois consumidores do agrupamento estão em
 * COLUNAS diferentes do grid da seção: `MethodGraph` (o SVG, à esquerda) e
 * `MethodSteps` (a `<ul>` alcançável, à direita). Um agrupamento só, para os
 * dois — se divergissem, o rótulo do anel e o passo da lista deixariam de ser
 * a mesma coisa.
 *
 * A contagem por anel é a fonte de verdade do PulseCircle (RING_NODE_COUNTS),
 * não um literal repetido aqui.
 */
export function groupMethodLabels(
  labels: ReadonlyArray<string>,
): ReadonlyArray<ReadonlyArray<string>> {
  const groups: string[][] = [];
  let cursor = 0;
  for (const count of RING_NODE_COUNTS) {
    groups.push(labels.slice(cursor, cursor + count));
    cursor += count;
  }
  return groups;
}
