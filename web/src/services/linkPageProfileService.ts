import { privateApi } from './apiConfig';
import { LinkPageProfileRequest, LinkPageProfileResponse } from '@/types/linkPageProfile';

export const linkPageProfileService = {
  async getLinkPageProfile(): Promise<LinkPageProfileResponse> {
    const response = await privateApi.get('/api/professional/link-page-profile');
    return response.data;
  },

  async updateLinkPageProfile(request: LinkPageProfileRequest): Promise<LinkPageProfileResponse> {
    const response = await privateApi.put('/api/professional/link-page-profile', request);
    return response.data;
  },

};
