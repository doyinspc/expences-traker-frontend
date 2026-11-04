export const allowsCashDisbursement = documentType => [2, 3].includes(Number(documentType));

export function workflowStepPayload(values, documentType) {
  return allowsCashDisbursement(documentType) ? values : {...values, text_4: 'approval'};
}
