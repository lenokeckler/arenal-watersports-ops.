export interface UpdateStatusRequest {
  status: string;
  comment?: string;
  userId: string;
}

export interface UpdateStatusResponse {
  success: boolean;
  updatedReservation: {
    id: string;
    status: string;
    statusUpdatedAt: string;
  };
  logId: string;
}
