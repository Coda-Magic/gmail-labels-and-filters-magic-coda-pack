import * as coda from "@codahq/packs-sdk";
import * as schemas from "./schemas";
import * as helpers from "./helpers";
import * as converters from "./converters";

export const pack = coda.newPack();

pack.addNetworkDomain("googleapis.com");

pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://accounts.google.com/o/oauth2/token",
  scopes: [
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/gmail.settings.basic",
    "https://www.googleapis.com/auth/gmail.modify",
  ],
});

pack.addSyncTable({
  name: "Labels",
  description: "Labels",
  identityName: "Labels",
  schema: schemas.LabelSchema,
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
        results.push(await converters.toLabel(label));
      }
      return {
        result: results,
      };
    },
  },
});

pack.addSyncTable({
  name: "Filters",
  description: "Filters",
  identityName: "Filters",
  schema: schemas.FilterSchema,
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
        results.push(await converters.toFilter(filter));
      }
      return {
        result: results,
      };
    },
  },
});

pack.addSyncTable({
  name: "Messages",
  description: "Messages",
  identityName: "Messages",
  schema: schemas.MessageSchema,
  formula: {
    name: "SyncMessages",
    description: "<Help text for the sync formula, not show to the user>",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "query",
        description: "Query parameters.",
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "maxResults",
        description: "Maximum number of items to return.",
      }),
    ],
    execute: async function ([query = "is:unread", maxResults = 10], context) {
      let results = [];
      let pageToken = "";

      do {
        let url =
          "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=" +
          maxResults +
          "&q=" +
          encodeURIComponent(query);
        if (pageToken.length > 0) url = url + "&pageToken=" + pageToken;
        let response = await context.fetcher.fetch({
          url: url,
          method: "GET",
        });
        console.log(response);
        for (let message of response.body.messages) {
          console.log("Getting details " + message.id);
          let details = await helpers.getMessageDetails(context, message);
          console.log(details);
          results.push(await converters.toMessage(details));
        }
        pageToken =
          response.body.nextPageToken == undefined
            ? ""
            : response.body.nextPageToken;
      } while (pageToken.length > 0);
      return {
        result: results,
      };
    },
  },
});

pack.addFormula({
  name: "AddLabelsToMessage",
  description: "Add labels to a message",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "messageId",
      description: "Message ID modify.",
      required: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "labelIds",
      description: "Label IDs to add.",
      required: true,
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: true,

  execute: async function ([messageId, labelIds], context) {
    let url =
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/" +
      messageId +
      "/modify";
    let body = JSON.stringify({
      addLabelIds: labelIds,
    });
    console.log(body);
    let response = await context.fetcher.fetch({
      url: url,
      method: "POST",
      body: body,
    });
    return "";
  },
});

pack.addFormula({
  name: "UpdateFilter",
  description: "Update filter",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "criteriaFrom",
      description: "Criteria from.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "criteriaTo",
      description: "Criteria to.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "criteriaSubject",
      description: "Criteria subject.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "criteriaQuery",
      description: "Criteria query.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.Boolean,
      name: "criteriaHasAttachment",
      description: "Criteria has attachment?",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.StringArray,
      name: "actionLabelsToAdd",
      description: "Action labels to add.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.StringArray,
      name: "actionLabelsToRemove",
      description: "Action labels to remove.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "actionForward",
      description: "Action forward email.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "filterId",
      description: "Filter ID.",
      required: true,
    }),
  ],
  resultType: coda.ValueType.Object,
  schema: coda.withIdentity(schemas.FilterSchema, "Filter"),
  isAction: true,

  execute: async function (
    [
      criteriaFrom,
      criteriaTo,
      criteriaSubject,
      criteriaQuery,
      criteriaHasAttachment,
      actionLabelsToAdd,
      actionLabelsToRemove,
      actionForward,
      filterId,
    ],
    context
  ) {
    let create_url =
      "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters";
    let delete_url =
      "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/" +
      filterId;
    let body: any = { criteria: {}, action: {} };

    if (criteriaFrom) {
      body.criteria.from = criteriaFrom;
    }
    if (criteriaTo) {
      body.criteria.to = criteriaTo;
    }
    if (criteriaSubject) {
      body.criteria.to = criteriaSubject;
    }
    if (criteriaQuery) {
      body.criteria.to = criteriaQuery;
    }
    if (criteriaHasAttachment) {
      body.criteria.to = criteriaHasAttachment;
    }
    if (actionLabelsToAdd) {
      body.action.addLabelIds = actionLabelsToAdd;
    }
    if (actionLabelsToAdd) {
      body.action.removeLabelIds = actionLabelsToRemove;
    }
    if (actionForward) {
      body.action.forward = actionForward;
    }
    console.log("Creating " + body);
    let create_response = await context.fetcher.fetch({
      url: create_url,
      method: "POST",
      body: JSON.stringify(body),
    });
    console.log("Created " + JSON.stringify(create_response.body));

    console.log("Deleting " + delete_url);

    let response = await context.fetcher.fetch({
      url: delete_url,
      method: "DELETE",
    });

    console.log("Delete response: " + JSON.stringify(response.body));
    console.log(await converters.toFilter(create_response.body));
    return await converters.toFilter(create_response.body);
  },
});

pack.addFormula({
  name: "DeleteFilter",
  description: "Delete filter",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "filterId",
      description: "Filter ID.",
      required: true,
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: true,
  execute: async function ([filterId], context) {
    let delete_url =
      "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/" +
      filterId;

    let response = await context.fetcher.fetch({
      url: delete_url,
      method: "DELETE",
    });

    return "";
  },
});
