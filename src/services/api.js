const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // User API methods
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Roles API methods
  async getRoles() {
    return this.request('/roles');
  }

  async getRoleById(id) {
    return this.request(`/roles/${id}`);
  }

  async createRole(roleData) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id, roleData) {
    return this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id) {
    return this.request(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth API methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Features API methods
  async getFeatures() {
    return this.request('/features');
  }

  async getFeatureById(id) {
    return this.request(`/features/${id}`);
  }

  async createFeature(featureData) {
    return this.request('/features', {
      method: 'POST',
      body: JSON.stringify(featureData),
    });
  }

  async updateFeature(id, featureData) {
    return this.request(`/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(featureData),
    });
  }

  async deleteFeature(id) {
    return this.request(`/features/${id}`, {
      method: 'DELETE',
    });
  }

  // Permissions API methods
  async getPermissions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.role_id) params.append('role_id', filters.role_id);
    if (filters.feature_id) params.append('feature_id', filters.feature_id);

    const queryString = params.toString();
    const endpoint = `/permissions${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getPermissionById(id) {
    return this.request(`/permissions/${id}`);
  }

  async createPermission(permissionData) {
    return this.request('/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  }

  async updatePermission(id, permissionData) {
    return this.request(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  }

  async updatePermissionByFeatureAndRole(featureId, roleId, permissionData) {
    return this.request(`/permissions/feature/${featureId}/role/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  }

  async deletePermission(id) {
    return this.request(`/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  // Contents API methods
  async getContents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.content_type) params.append('content_type', filters.content_type);
    if (filters.content_source) params.append('content_source', filters.content_source);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/contents${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getContentById(id) {
    return this.request(`/contents/${id}`);
  }

  async createContent(contentData) {
    return this.request('/contents', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async updateContent(id, contentData) {
    return this.request(`/contents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
  }

  async deleteContent(id) {
    return this.request(`/contents/${id}`, {
      method: 'DELETE',
    });
  }

  // Pages API methods
  async getPages(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/pages${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getPageById(id) {
    return this.request(`/pages/${id}`);
  }

  async createPage(pageData) {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  }

  async updatePage(id, pageData) {
    return this.request(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    });
  }

  async deletePage(id) {
    return this.request(`/pages/${id}`, {
      method: 'DELETE',
    });
  }

  async getPagesByChapter(chapterId) {
    return this.request(`/pages/chapter/${chapterId}`);
  }

  // Chapters API methods
  async getChapters(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/chapters${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getChapterById(id) {
    return this.request(`/chapters/${id}`);
  }

  async createChapter(chapterData) {
    return this.request('/chapters', {
      method: 'POST',
      body: JSON.stringify(chapterData),
    });
  }

  async updateChapter(id, chapterData) {
    return this.request(`/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chapterData),
    });
  }

  async deleteChapter(id) {
    return this.request(`/chapters/${id}`, {
      method: 'DELETE',
    });
  }

  async addPageToChapter(chapterId, pageId, orderIndex) {
    return this.request(`/chapters/${chapterId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ page_id: pageId, order_index: orderIndex }),
    });
  }

  async addPagesToChapter(chapterId, pageIds) {
    return this.request(`/chapters/${chapterId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ page_ids: pageIds }),
    });
  }

  async removePageFromChapter(chapterId, pageId) {
    return this.request(`/chapters/${chapterId}/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  async updateChapterPageOrder(chapterId, pageOrders) {
    return this.request(`/chapters/${chapterId}/pages/order`, {
      method: 'PUT',
      body: JSON.stringify({ pageOrders }),
    });
  }

  async getChaptersByCourse(courseId) {
    return this.request(`/chapters/course/${courseId}`);
  }

  // Courses API methods
  async getCourses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/courses${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getCourseById(id) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id, courseData) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async addChapterToCourse(courseId, chapterId, orderIndex) {
    return this.request(`/courses/${courseId}/chapters`, {
      method: 'POST',
      body: JSON.stringify({ chapter_id: chapterId, order_index: orderIndex }),
    });
  }

  async addChaptersToCourse(courseId, chapterIds) {
    return this.request(`/courses/${courseId}/chapters`, {
      method: 'POST',
      body: JSON.stringify({ chapter_ids: chapterIds }),
    });
  }

  async removeChapterFromCourse(courseId, chapterId) {
    return this.request(`/courses/${courseId}/chapters/${chapterId}`, {
      method: 'DELETE',
    });
  }

  async updateCourseChapterOrder(courseId, chapterOrders) {
    return this.request(`/courses/${courseId}/chapters/order`, {
      method: 'PUT',
      body: JSON.stringify({ chapterOrders }),
    });
  }

  async getCoursesByMenu(menuId) {
    return this.request(`/courses/menu/${menuId}`);
  }

  // Menus API methods
  async getMenus(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/menus${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getMenuById(id) {
    return this.request(`/menus/${id}`);
  }

  async createMenu(menuData) {
    return this.request('/menus', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  }

  async updateMenu(id, menuData) {
    return this.request(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuData),
    });
  }

  async deleteMenu(id) {
    return this.request(`/menus/${id}`, {
      method: 'DELETE',
    });
  }

  async addCourseToMenu(menuId, courseId, orderIndex) {
    return this.request(`/menus/${menuId}/courses`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, order_index: orderIndex }),
    });
  }

  async addCoursesToMenu(menuId, courseIds) {
    return this.request(`/menus/${menuId}/courses`, {
      method: 'POST',
      body: JSON.stringify({ course_ids: courseIds }),
    });
  }

  async removeCourseFromMenu(menuId, courseId) {
    return this.request(`/menus/${menuId}/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  async updateMenuCourseOrder(menuId, courseOrders) {
    return this.request(`/menus/${menuId}/courses/order`, {
      method: 'PUT',
      body: JSON.stringify({ courseOrders }),
    });
  }

  // Packages API methods
  async getPackages(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.package_type) params.append('package_type', filters.package_type);
    if (filters.menu_id) params.append('menu_id', filters.menu_id);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/packages${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getPackageById(id) {
    return this.request(`/packages/${id}`);
  }

  async createPackage(packageData) {
    return this.request('/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  async updatePackage(id, packageData) {
    return this.request(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  }

  async deletePackage(id) {
    return this.request(`/packages/${id}`, {
      method: 'DELETE',
    });
  }

  async addCourseToPackage(packageId, courseId) {
    return this.request(`/packages/${packageId}/courses`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  }

  async addCoursesToPackage(packageId, courseIds) {
    return this.request(`/packages/${packageId}/courses`, {
      method: 'POST',
      body: JSON.stringify({ course_ids: courseIds }),
    });
  }

  async removeCourseFromPackage(packageId, courseId) {
    return this.request(`/packages/${packageId}/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  async getPackageCourses(packageId) {
    return this.request(`/packages/${packageId}/courses`);
  }

  // Offers API methods
  async getOffers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.package_id) params.append('package_id', filters.package_id);
    if (filters.active_only) params.append('active_only', filters.active_only);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/offers${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getOfferById(id) {
    return this.request(`/offers/${id}`);
  }

  async createOffer(offerData) {
    return this.request('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  async updateOffer(id, offerData) {
    return this.request(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  }

  async deleteOffer(id) {
    return this.request(`/offers/${id}`, {
      method: 'DELETE',
    });
  }

  async getOffersByPackage(packageId) {
    return this.request(`/offers/package/${packageId}`);
  }
}

export default new ApiService();

