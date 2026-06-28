export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<{ text: string; pageCount: number }> {
  try {
    if (fileType === "application/pdf") {
      const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

      const { extractText: extractPdfText, getDocumentProxy } = await import("unpdf");

      const pdf = await getDocumentProxy(new Uint8Array(nodeBuffer));
      const { text, totalPages } = await extractPdfText(pdf, { mergePages: true });

      return {
        text: text,
        pageCount: totalPages,
      };
    }

    return { text: "", pageCount: 0 };

  } catch (error) {
    console.error("Critical PDF Parse Error:", error);
    throw new Error("Failed to extract text from document.");
  }
}
