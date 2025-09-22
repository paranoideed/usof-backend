export type paginationResponse = {
    offset: number;
    limit: number;
    total: number;
}

export type PaginationRequest = {
    page?: number;
    limit?: number;
}