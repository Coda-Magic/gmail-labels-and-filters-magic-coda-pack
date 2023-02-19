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
        let details = await helpers.getMessageDetails(context, message);
        results.push(await converters.toMessage(details));
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

pack.addFormula({
  name: "CreateLabel",
  description: "Create label",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "name",
      description: "Label name.",
      required: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "labelListVisibility",
      description: "Label list visibility.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "messageListVisibility",
      description: "Message list visiblity.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "textColor",
      description: "Text color.",
      required: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "backgroundColor",
      description: "Background color.",
      required: true,
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: true,

  execute: async function (
    [
      id,
      name,
      labelListVisibility,
      messageListVisibility,
      textColor,
      backgroundColor,
    ],
    context
  ) {
    let url = "https://gmail.googleapis.com/gmail/v1/users/{userId}/labels";
    let body: any = {
      name: name,
      type: "user",
    };
    if (messageListVisibility) {
      body.messageListVisibility = messageListVisibility;
    }

    if (labelListVisibility) {
      body.labelListVisibility = labelListVisibility;
    }
    if (textColor) {
      body.color.textColor = textColor;
    }
    if (backgroundColor) {
      body.color.backgroundColor = backgroundColor;
    }
    let response = await context.fetcher.fetch({
      url: url,
      method: "POST",
      body: JSON.stringify(body),
    });
    return await converters.toLabel(response.body);
  },
});

pack.addFormula({
  name: "DeleteLabel",
  description: "Delete label",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "id",
      description: "Label ID.",
      required: true,
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: true,
  execute: async function ([id], context) {
    let url = "https://gmail.googleapis.com/gmail/v1/users/me/labels/" + id;
    let response = await context.fetcher.fetch({
      url: url,
      method: "DELETE",
    });
    return "";
  },
});

pack.addFormula({
  name: "UpdateLabel",
  description: "Update label",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "id",
      description: "Label ID.",
      required: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "name",
      description: "Label name.",
      required: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "labelListVisibility",
      description: "Label list visibility.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "messageListVisibility",
      description: "Message list visiblity.",
      required: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "textColor",
      description: "Text color.",
      required: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "backgroundColor",
      description: "Background color.",
      required: true,
    }),
  ],
  resultType: coda.ValueType.Object,
  schema: coda.withIdentity(schemas.LabelSchema, "Labels"),
  isAction: true,

  execute: async function (
    [
      id,
      name,
      labelListVisibility,
      messageListVisibility,
      textColor,
      backgroundColor,
    ],
    context
  ) {
    let url = "https://gmail.googleapis.com/gmail/v1/users/me/labels/" + id;
    let body: any = {
      id: id,
      name: name,
      type: "user",
    };
    if (messageListVisibility) {
      body.messageListVisibility = messageListVisibility;
    }

    if (labelListVisibility) {
      body.labelListVisibility = labelListVisibility;
    }
    if (textColor) {
      body.color.textColor = textColor;
    }
    if (backgroundColor) {
      body.color.backgroundColor = backgroundColor;
    }
    console.log(JSON.stringify(body));
    let response = await context.fetcher.fetch({
      url: url,
      method: "PATCH",
      body: JSON.stringify(body),
    });
    console.log(await converters.toLabel(response.body));
    return await converters.toLabel(response.body);
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
  resultType: coda.ValueType.Object,
  schema: coda.withIdentity(schemas.MessageSchema, "Messages"),
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
    return await converters.toMessage(response.body);
  },
});

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
      body.criteria.query = criteriaQuery;
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
  name: "CreateFilter",
  description: "Create filter",
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
    ],
    context
  ) {
    let create_url =
      "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters";
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
