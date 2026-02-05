declare module 'pdf-parse-fork' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: Record<string, any> | null;
    text: string;
    version: string;
  }

  interface PDFOptions {
    pagerender?: ((pageData: any) => string) | undefined;
    max?: number | undefined;
    version?: string | undefined;
  }

  interface PDFCallable {
    (dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;
  }

  const pdf: PDFCallable;
  export default pdf;
}
