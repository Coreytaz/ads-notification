export class ParamsExtractor {
  private string = "";
  private _route = "";
  private _params: any = {};

  constructor(inputString: string) {
    this.string = inputString;
    this._route = this.extractRoute();
    this._params = this.extractParams();
  }

  get route() {
    return this._route;
  }

  get params() {
    return this._params;
  }

  protected clearParams() {
    this._params = {};
  }

  private extractParams() {
    const regex = /{([^}]+)}/g;
    if (!this.string) return {};
    const matches = this.string.match(regex);

    if (!matches) {
      return {};
    }

    const params: Record<string, string> = {};

    matches.forEach(match => {
      const [key, value] = match.slice(1, -1).split(":");
      if (key && value) {
        params[key.trim()] = value.trim();
      }
    });

    return params;
  }

  private extractRoute() {
    return this.string ? this.string.replace(/{[^}]+}/g, "").trim() : "";
  }

  toString() {
    let result = this._route;
    for (const [key, value] of Object.entries(this._params)) {
      result += `{${key}:${String(value)}}`;
    }
    return result;
  }

  addParams(params: Record<string, string | number | boolean>) {
    for (const [key, value] of Object.entries(params)) {
      this.addParam(key, value);
    }
  }

  addParam(key: string, value: string | number | boolean) {
    const valueStr = value.toString();
    if (key && valueStr.length > 0) {
      this._params[key.trim()] = valueStr;
    } else {
      // eslint-disable-next-line no-console
      console.error("Key and value must be provided");
    }
  }
}
