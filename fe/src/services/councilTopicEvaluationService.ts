const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface UpsertNoteRequest {
	topicId: number;
	councilMemberId: number;
	note: string;
}

class CouncilTopicEvaluationService {
	private baseUrl: string;
	constructor() {
		this.baseUrl = `${API_BASE_URL}/topic-approval-service/api/council-topic-evaluations`;
	}

	private getAuthHeaders(): HeadersInit {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('accessToken');
			if (token) headers['Authorization'] = `Bearer ${token}`;
		}
		return headers;
	}

	async upsertNote(req: UpsertNoteRequest) {
		const res = await fetch(`${this.baseUrl}/create`, {
			method: 'POST',
			headers: this.getAuthHeaders(),
			credentials: 'include',
			body: JSON.stringify(req),
		});
		
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.message || `Failed to upsert note: ${res.status}`);
		}
		
		const data = await res.json();
		console.log('✅ Note saved successfully:', data);
		return data.data;
	}

	async getNotesByTopic(topicId: number) {
		const res = await fetch(`${this.baseUrl}/by-topic/${topicId}`, {
			method: 'GET',
			headers: this.getAuthHeaders(),
			credentials: 'include',
		});
		if (!res.ok) {
			throw new Error(`Failed to fetch notes: ${res.status}`);
		}
		const data = await res.json();
		return data.data ?? [];
	}
}

export const councilTopicEvaluationService = new CouncilTopicEvaluationService();
export default councilTopicEvaluationService;


