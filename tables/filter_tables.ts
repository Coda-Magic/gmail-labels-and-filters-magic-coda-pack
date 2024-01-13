import { toFilter, updateFilter } from "../helpers/filter_helpers";
import { Logger } from "../logging";
import { FilterSchema } from "../schemas/filter_schemas";

export function addFiltersTable(pack, logger: Logger) {
  pack.addSyncTable({
    name: "Filters",
    description: "Filters",
    identityName: "Filters",
    schema: FilterSchema,
    formula: {
      name: "SyncFilters",
      description: "<Help text for the sync formula, not show to the user>",
      parameters: [],
      execute: async function ([], context) {
        let results = [];
        console.log("Getting filters");
        let url =
          "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters";
        let response = await context.fetcher.fetch({
          url: url,
          method: "GET",
        });
        console.log(response.body);
        for (let filter of response.body.filter) {
          results.push(await toFilter(filter));
        }
        return {
          result: results,
        };
      },
      executeUpdate: async function ([], updates, context) {
        const update = updates[0]; // Only one row at a time, by default.
        const filter = update.newValue;
        console.log(JSON.stringify(filter));

        // Update the task in Todoist.
        const updatedFilter = await updateFilter(context, filter);

        // Return the final state of the task.
        return {
          result: [updatedFilter],
        };
      },
    },
  });
}
