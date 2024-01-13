import * as coda from "@codahq/packs-sdk";

export function addGetMessageCountFormula(pack, logger: Logger) {
  pack.addFormula({
    name: "GetMessageCount",
    description: "Get message count by query",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "query",
        description: "Query to search messages.",
        required: true,
      }),
    ],
    resultType: coda.ValueType.Number,
    execute: async function ([query = "is:unread"], context) {
      let results = [];
      console.log("Getting messages for " + query);
      let url =
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=" +
        encodeURIComponent(query);
      let done = false;
      let total = 0;
      let pageToken;
      while (!done) {
        if (pageToken) {
          url = url + "&pageToken=" + pageToken;
        }
        try {
          let response = await context.fetcher.fetch({
            url: url,
            method: "GET",
          });
          total += response.body.messages.length;
          let continuation;
          pageToken = response.body.nextPageToken;
          if (pageToken) {
            continuation = {
              pageToken: pageToken,
            };
          } else {
            done = true;
          }
        } catch (error) {
          console.log(error);
        }
      }
      return total;
    },
  });
}

export function addApplyLabelsToMessagesFormula(pack, logger: Logger) {
  pack.addFormula({
    name: "ApplyLabelsToMessages",
    description: "Add labels to a list of messages",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "query",
        description: "Message query.",
        required: true,
      }),
      coda.makeParameter({
        type: coda.ParameterType.StringArray,
        name: "labelsToAdd",
        description: "Label IDs to add.",
        required: true,
      }),
      coda.makeParameter({
        type: coda.ParameterType.StringArray,
        name: "labelsToRemove",
        description: "Label IDs to remove.",
        required: true,
      }),
    ],
    resultType: coda.ValueType.String,
    isAction: true,
    execute: async function ([query, labelsToAdd, labelsToRemove], context) {
      let url =
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=" +
        encodeURIComponent(query);
      let response = await context.fetcher.fetch({
        url: url,
        method: "GET",
      });
      for (let message of response.body.messages) {
        console.log("Adding labels to message " + message.id);
        url =
          "https://gmail.googleapis.com/gmail/v1/users/me/messages/" +
          message.id +
          "/modify";
        let body = JSON.stringify({
          addLabelIds: labelsToAdd,
          removeLabelIds: labelsToRemove,
        });
        let response = await context.fetcher.fetch({
          url: url,
          method: "POST",
          body: body,
        });
        console.log(response.body);
      }
      return "";
    },
  });
}
