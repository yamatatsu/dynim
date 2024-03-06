import type { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { DeserializeMiddleware, MetadataBearer } from "@smithy/types";
import { any, object, parse, string } from "valibot";

const requestSchema = object({ headers: object({ "x-amz-target": string() }) });
const putInputSchema = object({ TableName: string(), Item: any() });
const getInputSchema = object({ TableName: string(), Key: any() });

type Options = {
	logger?: Console["log"];
};

export default class Dynim {
	private store: Map<string, Record<string, AttributeValue>>;
	constructor(private options?: Options) {
		this.store = new Map<string, Record<string, AttributeValue>>();
	}
	public addMiddleware(client: DynamoDBClient) {
		const middleware: DeserializeMiddleware<object, MetadataBearer> =
			(next) => async (args) => {
				// FIXME: For develop
				const res = await next(args);
				this.options?.logger?.({ args: JSON.stringify(args) });
				this.options?.logger?.({
					output: JSON.stringify(res.output),
				});

				const request = parse(requestSchema, args.request);

				const command = request.headers["x-amz-target"].split(".")[1];

				switch (command) {
					case "PutItem": {
						const input = parse(putInputSchema, args.input);
						const key = `${input.TableName}__${input.Item.pk.S}__${input.Item.sk.S}`;
						this.store.set(key, input.Item);
						return {
							response: new Response(),
							output: {
								$metadata: {
									attempts: 1,
									cfId: undefined,
									extendedRequestId: undefined,
									httpStatusCode: 200,
									requestId: "8c2cbda9-e05f-4b11-ad7e-c10e876a2f5a",
									totalRetryDelay: 0,
								},
							},
						};
					}
					case "GetItem": {
						const input = parse(getInputSchema, args.input);
						const key = `${input.TableName}__${input.Key.pk.S}__${input.Key.sk.S}`;
						const item = this.store.get(key);
						return {
							response: new Response(),
							output: {
								$metadata: {
									attempts: 1,
									cfId: undefined,
									extendedRequestId: undefined,
									httpStatusCode: 200,
									requestId: "8c2cbda9-e05f-4b11-ad7e-c10e876a2f5a",
									totalRetryDelay: 0,
								},
								Item: item,
							},
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
