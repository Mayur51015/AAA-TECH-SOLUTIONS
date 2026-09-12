import { apiRequest } from './api';

/**
 * Submit contact form inquiry to MySQL backend
 * @param {{ name: string, email: string, phone?: string, subject?: string, message: string }} data
 */
export async function submitContact(data) {
  return await apiRequest('/contacts', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || data.inquiryType || 'General Inquiry',
      message: data.message
    })
  });
}

export const submitContactMessage = submitContact;

/**
 * Get all contact inquiries (Admin)
 */
export async function getContacts() {
  return await apiRequest('/contacts', {
    method: 'GET'
  });
}

/**
 * Update contact inquiry status (Admin)
 */
export async function updateContactStatus(id, status) {
  return await apiRequest(`/contacts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
