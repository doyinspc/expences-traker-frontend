export const allowsCashDisbursement = documentType => [3, 9].includes(Number(documentType));

export function workflowStepPayload(values, documentType) {
  return allowsCashDisbursement(documentType) ? values : {...values, text_4: 'approval'};
}
