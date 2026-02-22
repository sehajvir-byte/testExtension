// import { PDFParse } from 'pdf-parse';

// /**
//  * Extracts all embedded images from a PDF file.
//  * @param pdfBuffer The PDF file content as an ArrayBuffer or Uint8Array
//  * @returns A promise that resolves to an array of Base64 Data URLs
//  */
// export async function extractImagesFromPdf(pdfBuffer: ArrayBuffer | Uint8Array): Promise<string[]> {
//   try {
//     // Convert to Uint8Array if necessary
//     const data = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);

//     // Initialize the parser
//     const parser = new PDFParse({ data });

//     // Extract images
//     // imageThreshold: 0 ensures we don't filter out small icons/images
//     // imageDataUrl: true returns strings ready for <img> tags
//     const result = await parser.getImage({ 
//       imageThreshold: 0, 
//       imageDataUrl: true 
//     });

//     // Extract all images from all pages into a flat array
//     const allImages: string[] = [];
    
//     result.pages.forEach((page: any) => {
//       if (page.images && page.images.length > 0) {
//         page.images.forEach((img: any) => {
//           if (img.data) {
//             allImages.push(img.data); // This is the Base64 Data URL
//           }
//         });
//       }
//     });

//     // Cleanup internal memory
//     await parser.destroy();

//     return allImages;
//   } catch (error) {
//     console.error("Failed to extract images from PDF:", error);
//     throw error;
//   }
// }
// async function saveImagesToBuffer(images: string[]) {
//     const storageObject: Record<string, string> = {};
    
//     images.forEach((base64, index) => {
//       const filename = `image${index}.png`;
//       storageObject[filename] = base64;
//     });
  
//     // Save to the "Buffer Zone"
//     await chrome.storage.local.set(storageObject);
    
//     console.log("Images ready in buffer zone.");
// }