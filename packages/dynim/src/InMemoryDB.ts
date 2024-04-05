import { randomUUID } from "node:crypto";
import {
	type AttributeValue,
	ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import type { MetadataBearer, ResponseMetadata } from "@smithy/types";
import { any, object, parse, string } from "valibot";
import { Options } from "./types.js";

const putInputSchema = object({ TableName: string(), Item: any() });
const getInputSchema = object({ TableName: string(), Key: any() });

type Table = Map<string, Record<string, AttributeValue>>;
type TableMap = Map<string, Table>;

export default class InMemoryDB {
	private tables: TableMap;
	constructor(private options?: Options) {
		this.tables = new Map<string, Table>();
		for (const tableDef of this.options?.tables ?? []) {
			if (!tableDef.TableName) {
				continue;
			}
			this.tables.set(
				tableDef.TableName,
				new Map<string, Record<string, AttributeValue>>(),
			);
		}
	}

	getItem(input: object) {
		const { TableName, Key } = parse(getInputSchema, input);
		const table = this.tables.get(TableName);
		if (!table) {
			throw new ResourceNotFoundException({
				message: "Cannot do operations on a non-existent table",
				$metadata: this.metadata(),
			});
		}
		const item = table.get(`${Key.pk.S}__${Key.sk.S}`);
		return { Item: item, $metadata: this.metadata() };
	}

	putItem(input: object): MetadataBearer {
		const { TableName, Item } = parse(putInputSchema, input);
		const table = this.tables.get(TableName);
		if (!table) {
			throw new ResourceNotFoundException({
				message: "Cannot do operations on a non-existent table",
				$metadata: this.metadata(),
			});
		}
		table.set(`${Item.pk.S}__${Item.sk.S}`, Item);
		return { $metadata: this.metadata() };
	}

	reset() {
		for (const tableName of this.tables.keys()) {
			this.tables.set(
				tableName,
				new Map<string, Record<string, AttributeValue>>(),
			);
		}
	}

	private metadata(): ResponseMetadata {
		return {
			cfId: undefined,
			extendedRequestId: undefined,
			httpStatusCode: 200,
			requestId: randomUUID(),
		};
	}
}
