import * as coda from "@codahq/packs-sdk";
import { Logger } from "../logging";
import { MessageSchema } from "../schemas";
import { getMessageDetails } from "../helpers/message_helpers";
import { toMessage } from "../converters";

export function addMessagesTable(pack, logger: Logger) {
  pack.addSyncTable({
    name: "Messages",
    description: "Messages",
    identityName: "Messages",
    schema: MessageSchema,
    formula: {
      name: "SyncMessages",
      description: "<Help text for the sync formula, not show to the user>",
      parameters: [
        coda.makeParameter({
          type: coda.ParameterType.String,
          name: "query",
          description: "Query parameters.",
        }),
      ],
      execute: async function ([query = "is:unread"], context) {
        let results = [];
        console.log("Getting messages for " + query);
        let url =
          "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=" +
          encodeURIComponent(query);
        let pageToken = context.sync.continuation?.pageToken;
        if (pageToken) {
          url = url + "&pageToken=" + pageToken;
        }
        let response = await context.fetcher.fetch({
          url: url,
          method: "GET",
        });
        for (let message of response.body.messages) {
          let details = await getMessageDetails(context, message);
          results.push(await toMessage(details));
        }
        let continuation;
        pageToken = response.body.nextPageToken;
        if (pageToken) {
          continuation = {
            pageToken: pageToken,
          };
        }
        return {
          result: results,
          continuation: continuation,
        };
      },
    },
  });
}
