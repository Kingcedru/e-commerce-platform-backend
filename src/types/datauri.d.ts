declare module "datauri" {
  class Datauri {
    format(ext: string, buffer: Buffer): Promise<string>;
  }
  export = Datauri;
}
