import { CreateTableInput } from "@aws-sdk/client-dynamodb";

export type Options = {
	logger?: Console["log"];
	tables: CreateTableInput[];
};
