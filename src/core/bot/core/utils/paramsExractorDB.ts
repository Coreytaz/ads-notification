import { createOneParamsTG, findOneParamsTG } from "@core/db/models";

import { ParamsExtractor } from "./paramsExtractor";

export class ParamsExtractorDB extends ParamsExtractor {
  key_db = "_db_params";
  private key_relation: string | null = null;

  constructor(
    inputString: string,
    { key_relation }: { key_relation?: string } = {},
  ) {
    super(inputString);
    this.key_relation = key_relation ?? null;
  }

  private async createParamDB() {
    const params = { ...this.params };
    const record = await createOneParamsTG({
      data: params,
      relationKey: this.key_relation ?? undefined,
    });
    return record.id;
  }

  async getParamsDB(id: number) {
    const record = await findOneParamsTG({ id });

    if (!record) {
      throw new Error("ParamsTG id not found");
    }

    const data = record.data;

    return data;
  }

  toStringDB(optioms?: { route: string }) {
    const { route = this.route } = optioms ?? {};
    const id = this.params[this.key_db];
    return this.toString({ route, params: { [this.key_db]: id } });
  }

  async toStringAsync() {
    const id = await this.createParamDB();
    this.clearParams();
    this.addParam(this.key_db, id);
    return this.toString();
  }
}
