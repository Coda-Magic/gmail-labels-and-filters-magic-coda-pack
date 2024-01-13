import * as coda from "@codahq/packs-sdk";
import * as utilities from "./utilities";

export async function toMessage(message: any) {
  let result: any = {
    id: message.id,
    snippet: message.snippet,
  };

  result.labels = [];
  for (let label of message.labelIds) {
    result.labels.push({ id: label });
  }
  for (let header of message.payload.headers) {
    if (header.name == "Subject") {
      result.subject = header.value;
    }
    if (header.name == "From") {
      result.from = header.value;
    }
    if (header.name == "Date") {
      result.date = header.value;
    }
    if (header.name == "To") {
      result.to = header.value;
    }
  }
  return result;
}
