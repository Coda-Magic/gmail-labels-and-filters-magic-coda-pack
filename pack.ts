import * as coda from "@codahq/packs-sdk";
import * as schemas from "./schemas";
import * as helpers from "./helpers";
import * as converters from "./converters";
import { addFiltersTable } from "./tables/filter_tables";
import { Logger } from "./logging";
import { addLabelsTable } from "./tables/label_tables";
import { addMessagesTable } from "./tables/message_tables";

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

const logger = new Logger("Startup");

addFiltersTable(pack, logger);
addLabelsTable(pack, logger);
addMessagesTable(pack, logger);
