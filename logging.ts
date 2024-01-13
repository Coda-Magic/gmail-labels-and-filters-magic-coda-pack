import { elastic_api_key, elastic_url } from "./constants";

export enum LogLevel {
  INFO = "info",
  ERROR = "error",
  WARNING = "warning",
}

export class Logger {
  elasticUrl: string;
  correlationId: string;
  apiKey: string;

  constructor(
    correlationId: string,
    elasticUrl: string = elastic_url,
    apiKey: string = elastic_api_key
  ) {
    this.elasticUrl = elasticUrl;
    this.correlationId = correlationId;
    this.apiKey = apiKey;
  }

  async sendLog(level: LogLevel, message: string): Promise<void> {
    try {
      return;
      await fetch(this.elasticUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey ${this.apiKey}`,
        },
        body: JSON.stringify({
          level,
          message,
          correlationId: this.correlationId,
        }),
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  public async info(message: string): Promise<void> {
    console.log(message);
    await this.sendLog(LogLevel.INFO, message);
  }

  public async error(message: string): Promise<void> {
    console.log(message);
    await this.sendLog(LogLevel.ERROR, message);
  }

  public async warning(message: string): Promise<void> {
    console.log(message);
    await this.sendLog(LogLevel.WARNING, message);
  }
}
