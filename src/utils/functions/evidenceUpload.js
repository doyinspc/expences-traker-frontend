const IMAGE_LIMIT = 1024 * 1024;
const PDF_LIMIT = 5 * IMAGE_LIMIT;
const PREVIEW_LIMIT = 15 * 1024;

function encode(canvas, quality) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('The image could not be compressed.')),
      'image/jpeg',
      quality,
    ),
  );
}

/**
 * Purpose: preserve readable item evidence while controlling upload and thumbnail size.
 * Algorithm: retain bounded PDFs; decode permitted images, resize the long edge to 1600,
 * and encode JPEG at progressively lower quality toward 500KB. Refuse a result over 1MB.
 * Create a separate <=15KB preview at <=240px; never replace the full evidence with it.
 * No minimum size is imposed and no browser-supplied MIME can bypass server validation.
 */
export async function prepareEvidenceUpload(file) {
  if (!file || !file.size) throw new Error('Choose a non-empty image or PDF.');
  if (file.type === 'application/pdf') {
    if (file.size > PDF_LIMIT)
      throw new Error('PDF files must be 5 MB or smaller.');
    return { file, preview: null };
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Choose a JPEG, PNG, WebP image or PDF.');
  if (file.size > 10 * IMAGE_LIMIT)
    throw new Error('Choose an image smaller than 10 MB before compression.');
  const image = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context)
      throw new Error('Image compression is unavailable in this browser.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let main;
    for (const quality of [0.85, 0.75, 0.65, 0.55]) {
      main = await encode(canvas, quality);
      if (main.size <= 500 * 1024) break;
    }
    if (main.size > IMAGE_LIMIT)
      throw new Error(
        'This image is still too large. Crop it to the important details and try again.',
      );
    const thumb = document.createElement('canvas');
    let preview;
    for (const edge of [240, 180, 120]) {
      const factor = Math.min(1, edge / Math.max(canvas.width, canvas.height));
      thumb.width = Math.max(1, Math.round(canvas.width * factor));
      thumb.height = Math.max(1, Math.round(canvas.height * factor));
      thumb.getContext('2d').drawImage(canvas, 0, 0, thumb.width, thumb.height);
      preview = await encode(thumb, 0.55);
      if (preview.size <= PREVIEW_LIMIT) break;
    }
    const name = file.name.replace(/\.[^.]+$/, '') || 'item-evidence';
    return {
      file: new File([main], `${name}.jpg`, { type: 'image/jpeg' }),
      preview:
        preview.size <= PREVIEW_LIMIT
          ? new File([preview], `${name}.preview.jpg`, { type: 'image/jpeg' })
          : null,
    };
  } finally {
    image.close();
  }
}

export const evidenceStageNames = {
  request: 'Requisition · what is needed',
  purchase_order: 'Purchase Order · quotation / invoice',
  procurement: 'Procurement · purchase / payment receipt',
  stock_receipt: 'Stock receipt · goods supplied',
  cash_advance_request: 'Cash Advance · request / quotation',
  cash_advance_receipt: 'Cash Advance · receipt / completed work',
  supporting_document: 'Supporting documents',
  legacy: 'Earlier attachment · stage not recorded',
};
