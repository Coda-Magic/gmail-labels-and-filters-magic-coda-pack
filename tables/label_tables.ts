import { toLabel } from "../helpers/label_helpers";
import { Logger } from "../logging";
import { LabelSchema } from "../schemas/label_schemas";

export function addLabelsTable(pack, logger: Logger) {
  pack.addSyncTable({
    name: "Labels",
    description: "Labels",
    identityName: "Labels",
    schema: LabelSchema,
    formula: {
      name: "SyncLabels",
      description: "<Help text for the sync formula, not show to the user>",
      parameters: [],
      execute: async function ([], context) {
        let results = [];
        let url = "https://gmail.googleapis.com/gmail/v1/users/me/labels";
        let response = await context.fetcher.fetch({
          url: url,
          method: "GET",
        });
        console.log(response.body);
        for (let label of response.body.labels) {
          results.push(await toLabel(label));
        }
        return {
          result: results,
        };
      },
    },
  });
}
