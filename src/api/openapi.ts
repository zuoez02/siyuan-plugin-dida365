export const UnauthorizedError = Error('Unauthorized');
export const ExceedQueryLimitError = Error('ExceedQueryLimitError');
export const UnknownError = Error('UnknownError');

export class OpenAPI {
    token = '';
    BASE_URL = 'https://api.dida365.com';

    constructor(token) {
        if (!token) {
            throw Error('openapi need token');
        }
        this.token = token;
    }

    async request(url, method, body?) {
        const res = await fetch(`${this.BASE_URL}${url}`, {
            method,
            headers: {
                Authorization: `Bearer ${this.token}`,
                Host: 'api.dida365.com',
            },
            body: body !== undefined
                ? typeof body === 'string' ? body : JSON.stringify(body)
                : undefined
        });
        if (res.status === 401) {
            throw UnauthorizedError
        }
        if (res.status === 500) {
            let d;
            try {
                d = await res.json();
            } catch (e) {
                throw UnknownError;
            }
            if (d.errorCode === 'exceed_query_limit') {
                throw ExceedQueryLimitError;
            }
        }
        if (res.status === 200) {
            if (res.headers.get('Content-Type').indexOf('application/json') !== -1) {
                return res.json();
            }
        }
        return res.text();
    }

    getProjectCompletedTasks(projectId) {
        return this.request(`/api/v2/project/${projectId}/completed`, 'GET');
      }

    getProjectWithData(projectId) {
        return this.request(`/open/v1/project/${projectId}/data`, 'GET')
    }

    getProjects() {
        return this.request('/open/v1/project', 'GET');
    }

    async syncData() {
        const projects = await this.getProjects();
        const result = [];
        for (const p of projects) {
            const data = await this.getProjectWithData(p.id);
            const completed = await this.getProjectCompletedTasks(p.id);
            data.tasks = data.tasks.concat(completed);
            result.push(data);
        }
        return result;
    }
}