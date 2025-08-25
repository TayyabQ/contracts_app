declare module "pdf-parse" {
  interface PDFParseResult {
    text: string;
    numpages?: number;
    info?: Record<string, unknown>;
    metadata?: unknown;
    version?: string;
  }
  function pdfParse(dataBuffer: Buffer | Uint8Array): Promise<PDFParseResult>;
  export default pdfParse;
}


