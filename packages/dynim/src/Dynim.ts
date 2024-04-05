import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { DeserializeMiddleware, MetadataBearer } from "@smithy/types";
import { object, parse, string } from "valibot";
import InMemoryDB from "./InMemoryDB.js";
import { Options } from "./types.js";

const requestSchema = object({ headers: object({ "x-amz-target": string() }) });

export class Dynim {
	private store: InMemoryDB;
	constructor(private options?: Options) {
		this.store = new InMemoryDB(options);
	}

	reset() {
		this.store.reset();
	}

	public addMiddleware(client: DynamoDBClient) {
		const middleware: DeserializeMiddleware<object, MetadataBearer> =
			() => async (args) => {
				const request = parse(requestSchema, args.request);
				const command = request.headers["x-amz-target"].split(".")[1];

				switch (command) {
					case "PutItem": {
						return {
							response: new Response(),
							output: this.store.putItem(args.input),
						};
					}
					case "GetItem": {
						return {
							response: new Response(),
							output: this.store.getItem(args.input),
						};
					}

					default:
						throw new Error(`unexpected command: ${command}`);
				}
			};

		client.middlewareStack.addRelativeTo(middleware, {
			name: "Dynim",
			relation: "after",
			toMiddleware: "DocumentUnmarshall",
			override: true,
		});
	}
}
