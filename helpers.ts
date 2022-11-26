import * as converters from "./converters";
import * as coda from "@codahq/packs-sdk";

export async function getMessageDetails(context, message) {
  let message_url =
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/" + message.id;
  let message_response = await context.fetcher.fetch({
    url: message_url,
    method: "GET",
  });
  return message_response.body;
}
