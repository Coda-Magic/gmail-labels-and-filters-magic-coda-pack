import * as coda from "@codahq/packs-sdk";
import { MessageSchema } from "../schemas";
import { Logger } from "../logging";
import { toMessage } from "../converters";
import { toLabel } from "../helpers/label_helpers";
import { LabelSchema } from "../schemas/label_schemas";

export function addAddLabelsToMessageFormula(pack, logger: Logger) {
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
    schema: coda.withIdentity(MessageSchema, "Messages"),
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
      return await toMessage(response.body);
    },
  });
}

export function addCreateLabelFormula(pack, logger: Logger) {
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
        description: "Message list visibility.",
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
      return await toLabel(response.body);
    },
  });
}
export function addDeleteLabelFormula(pack, logger: Logger) {
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
}

export function addUpdateLabelFormula(pack, logger: Logger) {
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
        description: "Message list visibility.",
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
    schema: coda.withIdentity(LabelSchema, "Labels"),
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
      console.log(await toLabel(response.body));
      return await toLabel(response.body);
    },
  });
}
