// Plagiarism Detection Types

export type PlagiarismResult = {
    reportId: number;
    fileUrl: string;
    similarity: number;
    similarityPercentage: number;
    status: string;
    matches: PlagiarismMatch[];
    totalMatches: number;
};

export type PlagiarismMatch = {
    score: number;
    source: string;
    similarity_percentage: number;
};

export type DetailedAnalysis = {
    reportId: number;
    fileUrl: string;
    overallSimilarity: number;
    detailedAnalysis: ChunkAnalysis[];
    totalChunks: number;
};

export type ChunkAnalysis = {
    chunkIndex: number;
    text: string;
    similarity: number;
    matches: any[];
};

export type UploadFile = {
    uid: string;
    name: string;
    status?: 'uploading' | 'done' | 'error' | 'removed';
    response?: any;
    url?: string;
    type?: string;
    size?: number;
};

export type PlagiarismCheckRequest = {
    documentVector: number[];
    docUrl: string;
    lectureId: number;
};

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
};

export type FileUploadStatus = 'idle' | 'uploading' | 'scanning' | 'completed' | 'error';

export type SimilarityLevel = 'low' | 'medium' | 'high';

export type FileType = 'pdf' | 'docx' | 'txt';

export type PlagiarismThreshold = {
    low: number;
    medium: number;
    high: number;
};
