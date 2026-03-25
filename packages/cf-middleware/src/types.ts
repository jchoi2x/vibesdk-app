export type TNext = () => Promise<Response>;
export type TMiddleware = (req: Request, next: TNext) => Promise<Response>;

export interface ICorsOptions {
  origins: string | string[] | RegExp;
  methods?: string[];
  headers?: string[];
  maxAge?: number;
  credentials?: boolean;
}
