import { apiRequest } from './api';

/**
 * Submit course enrollment application to MySQL backend
 * @param {{ full_name: string, email: string, mobile: string, course_id: number, plan_id?: number, message?: string }} data
 */
export async function submitEnrollment(data) {
  return await apiRequest('/enrollments', {
    method: 'POST',
    body: JSON.stringify({
      full_name: data.full_name || data.fullName,
      mobile: data.mobile,
      email: data.email,
      course_id: data.course_id || data.courseId,
      plan_id: data.plan_id || data.planId || null,
      message: data.message || ''
    })
  });
}

export const submitEnrollmentApplication = submitEnrollment;

/**
 * Get all enrollments (Admin)
 */
export async function getEnrollments() {
  return await apiRequest('/enrollments', {
    method: 'GET'
  });
}

/**
 * Update enrollment status (Admin)
 */
export async function updateEnrollmentStatus(id, status) {
  return await apiRequest(`/enrollments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
